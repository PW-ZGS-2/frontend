import type { RequestError } from "./Common";
import { ClientBase } from "./Common";

export interface Location {
    city?: string;
    country?: string;
    latitude: number;
    longitude: number;
}

export interface TelescopeSpecifications {
    aperture: number;
    focal_length: number;
    focal_ratio: number;
    weight: number;
    length: number;
    width: number;
    height: number;
    mount_type: 'ALT_AZ' | 'EQUATORIAL' | 'DOBSONIAN' | 'GOTO';
    optical_design: 'Reflector' | 'Refractor' | 'Catadioptric' | 'Schmidt-Cassegrain' | 'Maksutov' | 'Combination';
}

export interface TelescopeRequest {
    telescope_name?: string;
    telescope_type?: 'MOCK' | 'OPEN_SOURCE' | 'PROFESSIONAL';
    price_per_minute?: number;
    owner?: string;
    location: Location;
    status?: 'FREE' | 'LOCK' | 'DAMAGED';
    specifications: TelescopeSpecifications;
}

export interface PostTelescopeResponse {
    telescope_id: string;
    publish_token: string;
}

export interface StateResponse {
    subscribe_token: string;
}

export interface TelescopesResponse {
    available_telescopes: number;
    reserved_telescopes: number;
    unavailable_telescopes: number;
    telescopes: RegisteredTelescope[];
}

export interface RegisteredTelescope {
    telescope_id: string;
    telescope_name: string;
    price_per_minute: number;
    location: Location;
    status: 'FREE' | 'LOCK' | 'DAMAGED';
}

export interface ControlMessage {
    type: string;
    value: number;
}

export interface Interests {
    interesting: string[];
}

export class TelescopeApi extends ClientBase {
    createTelescope(
        telescope: TelescopeRequest,
        onComplete?: (data: PostTelescopeResponse) => void,
        errorSetter?: (error: RequestError) => void
    ) {
        return this.api.post('/telescopes/', telescope)
            .then(r => this.nullSafeOnComplete(r, onComplete))
            .catch(err => this.handleError(err, errorSetter));
    }

    updateTelescope(
        telescopeId: string,
        telescope: TelescopeRequest,
        onComplete?: (data: PostTelescopeResponse) => void,
        errorSetter?: (error: RequestError) => void
    ) {
        return this.api.put(`/telescopes/${telescopeId}`, telescope)
            .then(r => this.nullSafeOnComplete(r, onComplete))
            .catch(err => this.handleError(err, errorSetter));
    }

    deleteTelescope(
        telescopeId: string,
        onComplete?: (data: any) => void,
        errorSetter?: (error: RequestError) => void
    ) {
        return this.api.delete(`/telescopes/${telescopeId}`)
            .then(r => this.nullSafeOnComplete(r, onComplete))
            .catch(err => this.handleError(err, errorSetter));
    }

    getTelescopeDetails(
        telescopeId: string,
        onComplete?: (data: TelescopeSpecifications) => void,
        errorSetter?: (error: RequestError) => void
    ) {
        return this.api.get(`/telescopes/${telescopeId}`)
            .then(r => this.nullSafeOnComplete(r, onComplete))
            .catch(err => this.handleError(err, errorSetter));
    }

    getTelescopesList(
        onComplete?: (data: TelescopesResponse) => void,
        errorSetter?: (error: RequestError) => void
    ) {
        return this.api.get('/telescopes/list')
            .then(r => this.nullSafeOnComplete(r, onComplete))
            .catch(err => this.handleError(err, errorSetter));
    }

    updateTelescopeState(
        userId: string,
        telescopeId: string,
        state: 'FREE' | 'LOCK' | 'DAMAGED',
        onComplete?: (data: StateResponse) => void,
        errorSetter?: (error: RequestError) => void
    ) {
        return this.api.post(`/telescopes/${userId}/${telescopeId}/${state}`)
            .then(r => this.nullSafeOnComplete(r, onComplete))
            .catch(err => this.handleError(err, errorSetter));
    }

    controlTelescope(
        telescopeId: string,
        controlMessage: ControlMessage,
        onComplete?: (data: any) => void,
        errorSetter?: (error: RequestError) => void
    ) {
        return this.api.post(`/telescopes/control/${telescopeId}`, controlMessage)
            .then(r => this.nullSafeOnComplete(r, onComplete))
            .catch(err => this.handleError(err, errorSetter));
    }

    publishInterested(
        telescopeId: string,
        interests: Interests,
        onComplete?: (data: any) => void,
        errorSetter?: (error: RequestError) => void
    ) {
        return this.api.post(`/telescopes/interests/${telescopeId}`, interests)
            .then(r => this.nullSafeOnComplete(r, onComplete))
            .catch(err => this.handleError(err, errorSetter));
    }
}