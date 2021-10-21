import { Input, Component, OnInit, OnDestroy } from '@angular/core';
import { AlToastService } from '../services/al-toast.service';
import { MessageService } from 'primeng/api';
import { AlToastButtonDescriptor, AlToastMessage } from './types/al-toast.types';
import { Subscription } from 'rxjs';

@Component({
    selector: 'al-toast',
    templateUrl: './al-toast.component.html',
    styleUrls: ['./al-toast.component.scss']
})
export class AlToastComponent implements OnInit, OnDestroy {

    @Input() key: string;
    @Input() position?: string;

    private showEmiter: Subscription;
    private closeEmiter: Subscription;

    constructor(private alToastService: AlToastService,
        private messageService: MessageService) {
        if (!this.position) {
            this.position = 'bottom-center';
        }
    }

    ngOnInit() {
        this.showEmiter = this.alToastService.getShowEmitter(this.key).subscribe(this.onShow);
        this.closeEmiter = this.alToastService.getCloseEmitter(this.key).subscribe(this.onClose);
    }

    ngOnDestroy() {
        this.showEmiter.unsubscribe();
        this.closeEmiter.unsubscribe();
        this.alToastService.cleanEmitters(this.key);
    }

    public clickEvent(button:AlToastButtonDescriptor) {
        this.alToastService.emitButtonClicked(this.key, button);
    }

    private onShow = (alToastMessage: AlToastMessage) => {
        this.messageService.add(alToastMessage);
    }

    private onClose = () => {
        this.messageService.clear(this.key);
    }
}
