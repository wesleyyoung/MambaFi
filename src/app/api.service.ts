import {Injectable} from '@angular/core';
import {IpcRenderer} from 'electron';
import {Subject} from 'rxjs';
import {MatDialog} from '@angular/material';
import {WaitingDialogComponent} from './waiting-dialog/waiting-dialog.component';
import {WifiProfile} from './interfaces/wifi-profile';

@Injectable({
    providedIn: 'root'
})
export class ApiService {

    private readonly ipc: IpcRenderer | undefined;

    public profiles = new Subject<WifiProfile[]>();

    constructor(
        private dialog: MatDialog
    ) {
        if (window.require) {
            try {
                this.ipc = window.require('electron').ipcRenderer;

                this.on('profiles', (event: Electron.IpcMessageEvent, profiles: WifiProfile[]) => {

                    this.profiles.next(profiles);
                    this.closeDialogs();
                });

                this.on('newProfiles', (event: Electron.IpcMessageEvent, profiles: WifiProfile[]) => {

                    this.openWaitingDialog();
                    this.profiles.next(profiles);
                    this.closeDialogs();
                });

            } catch (e) {
                throw e;
            }
        } else {
            console.warn('Electron\'s IPC was not loaded');
        }
    }

    public on(channel: string, listener: any): void {

        if (!this.ipc) {
            return;
        }

        this.ipc.on(channel, listener);
    }

    public send(channel: string, ...args): void {

        if (!this.ipc) {
            return;
        }

        this.ipc.send(channel, ...args);
    }

    openWaitingDialog(): void {

        this.dialog.open(WaitingDialogComponent, {
            disableClose: true,
            panelClass: [
                'transparent-bg'
            ]
        });
    }

    public openFile(): void {

        this.send('getNewProfile');
    }

    public exportAllProfiles(): void {

        this.send('exportAllProfiles');
    }

    public addAllFromFolder(): void {

        this.send('addAllProfilesFromFolder');
    }

    public deleteProfiles(profiles: Array<WifiProfile>): void {

        this.send('deleteProfiles', profiles);
    }

    public exportProfiles(profiles: Array<WifiProfile>): void {

        this.send('exportProfiles', profiles);
    }

    closeDialogs(): void {
        this.dialog.closeAll();
        this.dialog.closeAll();
        this.dialog.closeAll();
        setTimeout(() => {
            this.closeDialogs();
        }, 250);
    }

    public refreshProfiles(): void {

        this.openWaitingDialog();
        this.send('refreshProfiles');
    }
}
