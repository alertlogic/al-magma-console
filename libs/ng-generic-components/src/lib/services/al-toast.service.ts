import { Injectable, EventEmitter } from '@angular/core';
import { AlToastButtonDescriptor, AlToastMessage } from '../al-toast/types/al-toast.types';

@Injectable({
    providedIn: 'root',
})
export class AlToastService
{
    private alToastButtonEmitters:{[i:string]:EventEmitter<AlToastButtonDescriptor>} = {};
    private alToastShowEmitters:{[i:string]:EventEmitter<AlToastMessage>} = {};
    private alToastCloseEmitters:{[i:string]:EventEmitter<void>} = {};


    public getButtonEmitter(key: string): EventEmitter<AlToastButtonDescriptor> {
        if(!this.alToastButtonEmitters.hasOwnProperty(key)) {
            this.alToastButtonEmitters[key] = new EventEmitter<AlToastButtonDescriptor>();
        }
        return this.alToastButtonEmitters[key];
    }

    public getShowEmitter(key: string): EventEmitter<AlToastMessage> {
        if(!this.alToastShowEmitters.hasOwnProperty(key)) {
            this.alToastShowEmitters[key] = new EventEmitter<AlToastMessage>();
        }
        return this.alToastShowEmitters[key];
    }

    public getCloseEmitter(key: string): EventEmitter<void> {
        if(!this.alToastCloseEmitters.hasOwnProperty(key)) {
            this.alToastCloseEmitters[key] = new EventEmitter<void>();
        }
        return this.alToastCloseEmitters[key];
    }

    public showMessage = (key: string, alToastMessage: AlToastMessage = {}) => {
        alToastMessage.key = key;
        if ( key in this.alToastShowEmitters ) {
            this.alToastShowEmitters[key].emit(alToastMessage);
        }
    }

    public clearMessages = (key: string)  => {
        this.alToastCloseEmitters[key].emit();
    }

    public emitButtonClicked(key: string, buttonClicked:AlToastButtonDescriptor) {
        if(!this.alToastButtonEmitters.hasOwnProperty(key)) {
            this.alToastButtonEmitters[key] = new EventEmitter<any>();
        }
        this.alToastButtonEmitters[key].emit(buttonClicked);
    }

    public cleanEmitters(key: string) {
        if(this.alToastButtonEmitters.hasOwnProperty(key)) {
            delete(this.alToastButtonEmitters[key]);
        }
        if(this.alToastShowEmitters.hasOwnProperty(key)) {
            delete(this.alToastShowEmitters[key]);
        }
        if(this.alToastCloseEmitters.hasOwnProperty(key)) {
            delete(this.alToastCloseEmitters[key]);
        }
    }
}
