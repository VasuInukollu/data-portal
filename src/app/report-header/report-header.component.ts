import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import Swal from 'sweetalert2';
import { BackendService } from '../backend.service';

@Component({
  selector: 'app-report-header',
  templateUrl: './report-header.component.html',
  styleUrls: ['./report-header.component.scss']
})
export class ReportHeaderComponent implements OnChanges {

  @Input() reportConfig: any;

  permissions: { scope: string, name: string, owner: boolean }[] = [];
  reportOwner = false;

  constructor(private service: BackendService) { }

  ngOnChanges(changes: SimpleChanges): void {
    this.calculatePermissions(changes.reportConfig.currentValue);
  }

  calculatePermissions(config: any): void {
    // evaluate permissions
    this.permissions = [];
    const perms: string[] = config.permissions?.split(';');
    if (perms === undefined) { return; }
    const currentUserId = this.service.getCurrentUserId().toUpperCase();

    perms.forEach((perm) => {
      const parts: string[] = perm.split(':');
      if (parts.length === 2) {
        if (parts[0].toUpperCase() === 'OWNER') {
          if (parts[1].toUpperCase() === currentUserId) { this.reportOwner = true; }
          this.permissions.push({ scope: 'Owner', name: parts[1], owner: true });
        }
        else if (parts[0].toUpperCase() === 'USER') {
          this.permissions.push({ scope: 'User', name: parts[1], owner: false });
        }
        else if (parts[0].toUpperCase() === 'ROLE') {
          this.permissions.push({ scope: 'Role', name: parts[1], owner: false });
        }
      }
    });

  }

  removePermission({ scope, name }): void {
    this.service.removePermission(this.reportConfig.id, { scope, name }).subscribe(() => {
      this.updatePermissions();
    }, err => {
      Swal.fire({ icon: 'error', title: 'Oops...', text: err.message });
    });
  }

  addPermission(): void {
    Swal.fire({
      title: 'User Id',
      input: 'text',
      inputAttributes: {
        autocapitalize: 'off'
      },
      showCancelButton: true,
      confirmButtonText: 'Share',
      showLoaderOnConfirm: true,
      preConfirm: (username) => {

        this.service.addPermission(
          this.reportConfig.id, { scope: 'User', name: username }
        ).subscribe(
          (data: any) => {
            Swal.fire({ icon: 'success', title: 'Report shared successfully.' }).then(() => {
              this.updatePermissions();
            });
          },
          err => {
            Swal.fire({ icon: 'error', title: 'Oops...', text: err.statusText, });
          }
        );

      },

    });

  }

  updatePermissions(): void {
    this.service.getReportConfig(this.reportConfig.id).subscribe((config) => {
      this.calculatePermissions(config);
    });
  }

}
