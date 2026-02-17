import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface AudioFile {
    title: string;
    file: ExternalBlob;
    description: string;
}
export interface UserProfile {
    exportsRemaining: bigint;
    name: string;
    plan: PlanType;
}
export enum PlanType {
    creator = "creator",
    studio = "studio",
    free = "free",
    full = "full"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addAudioFile(title: string, description: string, file: ExternalBlob): Promise<void>;
    addUserProfile(user: Principal, profile: UserProfile): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteAudioFile(audioToDelete: AudioFile): Promise<void>;
    getAllUserProfiles(): Promise<Array<UserProfile>>;
    getAllUsers(): Promise<Array<Principal>>;
    getCallerAudioFiles(): Promise<Array<AudioFile>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getUserAudioFiles(user: Principal): Promise<Array<AudioFile>>;
    getUserCountByPlan(plan: PlanType): Promise<bigint>;
    getUserProfile(user: Principal): Promise<UserProfile>;
    isCallerAdmin(): Promise<boolean>;
    resetMonthlyExports(): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateUserPlan(user: Principal, plan: PlanType): Promise<void>;
    useExport(): Promise<void>;
}
