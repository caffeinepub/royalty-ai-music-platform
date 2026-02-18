import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import List "mo:core/List";

import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  public type PlanType = {
    #free;
    #creator;
    #studio;
    #full;
  };

  public type UserProfile = {
    name : Text;
    plan : PlanType;
    exportsRemaining : Nat;
  };

  public type AudioFile = {
    title : Text;
    description : Text;
    file : Storage.ExternalBlob;
  };

  public type UserAudio = {
    owner : Principal;
    title : Text;
    description : Text;
    file : Storage.ExternalBlob;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let audioFiles = Map.empty<Principal, List.List<AudioFile>>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user) or AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user) or AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    switch (userProfiles.get(user)) {
      case (null) { Runtime.trap("User does not exist") };
      case (?profile) { profile };
    };
  };

  public shared ({ caller }) func addUserProfile(user : Principal, profile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can add user profiles");
    };
    userProfiles.add(user, profile);
  };

  public shared ({ caller }) func updateUserPlan(user : Principal, plan : PlanType) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can update user plans");
    };
    switch (userProfiles.get(user)) {
      case (null) { Runtime.trap("User not found") };
      case (?profile) {
        let updatedProfile = {
          profile with
          plan
        };
        userProfiles.add(user, updatedProfile);
      };
    };
  };

  public query ({ caller }) func getUserCountByPlan(plan : PlanType) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can access this data");
    };
    userProfiles.values().toArray().filter(func(profile) { profile.plan == plan }).size();
  };

  public query ({ caller }) func getAllUserProfiles() : async [UserProfile] {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can get all user profiles");
    };
    userProfiles.values().toArray();
  };

  public query ({ caller }) func getAllUsers() : async [Principal] {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can get all users");
    };
    userProfiles.keys().toArray();
  };

  public shared ({ caller }) func useExport() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user) or AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only users can use exports");
    };
    // Admin bypass: do not deduct exports for admins
    if (AccessControl.isAdmin(accessControlState, caller)) {
      return;
    };
    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User profile not found") };
      case (?profile) {
        if (profile.exportsRemaining == 0) {
          Runtime.trap("No exports remaining for this month");
        };
        if (profile.exportsRemaining >= 1) {
          let updatedProfile = {
            profile with
            exportsRemaining = profile.exportsRemaining - 1;
          };
          userProfiles.add(caller, updatedProfile);
        };
      };
    };
  };

  public shared ({ caller }) func resetMonthlyExports() : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can reset exports");
    };
    userProfiles.forEach(func(user, profile) {
      userProfiles.add(user, { profile with exportsRemaining = 10 });
    });
  };

  // Audio Library Functionality

  public shared ({ caller }) func addAudioFile(title : Text, description : Text, file : Storage.ExternalBlob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user) or AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only users can upload audio files");
    };
    let audioFile : AudioFile = {
      title;
      description;
      file;
    };
    let userAudioFiles = switch (audioFiles.get(caller)) {
      case (null) { List.empty<AudioFile>() };
      case (?files) { files };
    };
    userAudioFiles.add(audioFile);
    audioFiles.add(caller, userAudioFiles);
  };

  public query ({ caller }) func getCallerAudioFiles() : async [AudioFile] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user) or AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only users can access audio files");
    };
    switch (audioFiles.get(caller)) {
      case (null) { [] };
      case (?files) { files.toArray() };
    };
  };

  public query ({ caller }) func getUserAudioFiles(user : Principal) : async [AudioFile] {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own audio files");
    };
    switch (audioFiles.get(user)) {
      case (null) { [] };
      case (?files) { files.toArray() };
    };
  };

  public shared ({ caller }) func deleteAudioFile(audioToDelete : AudioFile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user) or AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only users can delete audio files");
    };

    let userAudioFiles = switch (audioFiles.get(caller)) {
      case (null) { Runtime.trap("Audio file not found") };
      case (?files) { files };
    };

    let originalSize = userAudioFiles.size();
    let updatedFiles = userAudioFiles.filter(
      func(audio) {
        not (
          audio.title == audioToDelete.title and audio.description == audioToDelete.description
        );
      }
    );

    // Verify that the file actually belonged to the caller
    if (updatedFiles.size() == originalSize) {
      Runtime.trap("Audio file not found or does not belong to caller");
    };

    audioFiles.add(caller, updatedFiles);
  };
};
