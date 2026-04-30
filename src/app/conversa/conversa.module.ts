import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ConversaPageRoutingModule } from './conversa-routing.module';

import { ConversaPage } from './conversa.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ConversaPageRoutingModule
  ],
  declarations: [ConversaPage]
})
export class ConversaPageModule {}
