import { DatePipe } from '@angular/common';
import { AfterViewInit, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { AudioPlayerComponent, Track } from 'ngx-audio-player';
import { AudioPlayerService } from 'ngx-audio-player/lib/service/audio-player-service/audio-player.service';
import Swal from 'sweetalert2';
import { BackendService } from '../backend.service';

@Component({
  selector: 'app-recordings-playback-dialog',
  templateUrl: './recordings-playback-dialog.component.html',
  styleUrls: ['./recordings-playback-dialog.component.scss'],
  providers: [DatePipe]
})
export class RecordingsPlaybackDialogComponent implements OnInit, AfterViewInit {
  @ViewChild(AudioPlayerComponent, { static: false }) player: AudioPlayerComponent;

  values = [];

  hasFile = false;
  playlist: Track[] = [{
    link: '',
    title: 'Call Audio',
  }];

  constructor(
    public dialogRef: MatDialogRef<RecordingsPlaybackDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private service: BackendService,
    private sanitizer: DomSanitizer,
    private datepipe: DatePipe) {

    this.values = [
      { name: 'ANI', value: data?.originNumber },
      { name: 'DNI', value: data?.originNumber },
      { name: 'Agent Id', value: data?.agentId },
      { name: 'Phone Id', value: data?.phoneId },
      { name: 'Start Time', value: this.datepipe.transform(data?.startTimestamp, 'dd/MM/yyyy HH:mm:ss') },
    ];

  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.player.repeat = 'none';

    this.service
      .getPlaybackWavFile(this.data.reportId, this.data.callId)
      .subscribe(
        (res: any) => {
          const link: any = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(res));
          this.player.audioPlayerService.setPlaylist([{
            link,
            title: 'Call Audio',
          }]);
          this.hasFile = true;
        },
        (err) => {
          console.log(err);
          Swal.fire({ icon: 'error', title: 'Oops...', text: err.statusText });
        }
      );

  }

  onEnded(event): void {
  }

  onClose(): void {
    this.dialogRef.close();
  }

}
