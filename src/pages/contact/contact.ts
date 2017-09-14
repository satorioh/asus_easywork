import {Component, ViewChild, ElementRef, OnInit} from '@angular/core';
import {NavController, Platform} from 'ionic-angular';
import {PopoverController} from 'ionic-angular';
import {PopOver} from '../../components/pop-over/pop-over';
import {DatePipe} from '@angular/common';
import {ToastController} from 'ionic-angular';
import {Network} from '@ionic-native/network';

declare var BMap;
declare var baidu_location: any;

@Component({
  selector: 'page-contact',
  providers: [DatePipe],
  templateUrl: 'contact.html'
})

export class ContactPageComponent implements OnInit {
  @ViewChild('bmap') mapElement: ElementRef;
  // @ViewChild('uid') uid:ElementRef;
  // @ViewChild('upwd') upwd:ElementRef;

  myDate: number;
  myCheckIn = {
    knockontime: '',
    knockonpos: '',
    knockofftime: '',
    knockoffpos: ''
  };
  uwid:string;
  upwd:string;

  constructor(private navCtrl: NavController,
              public platform: Platform,
              public popoverCtrl: PopoverController,
              private datePipe: DatePipe,
              public toastCtrl: ToastController,
              private network: Network) {
  }

  ngOnInit() {
    this.platform.ready().then(() => {
      this.ionViewCanEnter();
      this.loadMap();
      setInterval(() => {
        this.myDate = Date.now();
      }, 1000);
    })
  }

  ionViewCanEnter() {
    if (this.network.type == "none") {
      alert("请先连接网络");
      return false;
    } else {
      return true;
    }
  }

  loadMap() {
    //初始化地图
    let map = new BMap.Map(this.mapElement.nativeElement);

    //调用baidu SDK plugin获取经纬度
    baidu_location.getCurrentPosition(function (result) {
        if (result.describe == "网络定位成功") {
          console.dir(result);
          let ggpoint = new BMap.Point(result.longitude, result.latitude);

          //逆地址解析
          let geoc = new BMap.Geocoder();
          geoc.getLocation(ggpoint, function (rs) {
            let addComp = rs.addressComponents;
            let address = "您当前的位置：" + addComp.province + addComp.city + addComp.district + addComp.street + addComp.streetNumber;
            console.log(address);
            document.getElementById('position').textContent = address;
          });
        } else {
          alert("确保网络已连接，并在设置-应用-ASUS EasyWork-权限中开启位置信息权限，以正常使用定位功能");
        }
      },//function success
      function (err) {
        document.getElementById('position').textContent = err + "定位失败，请重试";
      });
  }

  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create(PopOver);
    popover.present({
      ev: myEvent
    });
  }

  presentToast(str) {
    let toast = this.toastCtrl.create({
      message: str,
      duration: 2000,
      position: 'top'
    });
    toast.present();
  }

  ampmChoose() {
    let time = parseInt(this.datePipe.transform(this.myDate, 'HH'));
    console.log(time);
    if (time <= 12) {
      this.checkIn('knock-on', 'knockontime', 'knockonpos');
    } else {
      this.checkIn('knock-off', 'knockofftime', 'knockoffpos');
    }
  }

  checkIn(knockType, knockTime, knockPos) {
    let knockOnTime = document.querySelector(`#${knockType} span.knock-time`);
    let knockOnPost = document.querySelector(`#${knockType} p.knock-pos`);
    let str = '';
    console.log(knockOnTime.textContent);
    if (knockOnTime.textContent) {
      str = "亲，不要重复打卡哦";
      this.presentToast(str);
      return;
    } else {
      knockOnTime.textContent = "打卡时间" + this.datePipe.transform(this.myDate, 'HH:mm:ss');
      this.myCheckIn[knockTime] = this.datePipe.transform(this.myDate, 'HH:mm:ss');
      knockOnPost.textContent = document.getElementById('position').textContent.substr(7);
      this.myCheckIn[knockPos] = knockOnPost.textContent;
      str = "打卡成功！";
      this.presentToast(str);
      console.dir(this.myCheckIn);
    }


  }

  login() {
    console.log(this.uwid+','+this.upwd);
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
      if(xhr.readyState===4){
        if(xhr.status ===200){
            doResponse(xhr);
        }else{
          alert("响应完成但有问题");
        }
      }
    };
    xhr.open('POST','http://192.168.2.6/login.php',true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send(`uwid=${this.uwid}&upwd=${this.upwd}`);
    //let str = '测试';
    let successToast = this.presentToast("登录成功");
    let errorToast = this.presentToast("用户名或密码错误");
    function doResponse(xhr){
      //console.log('开始处理响应消息');
      if(xhr.responseText=='success'){
        //str = "登录成功";
        document.getElementById('ucenter-content').innerHTML="";
        successToast;
      }else if(xhr.responseText=='error'){
        //str = "用户名或密码错误";
        errorToast;
      }else {
        alert('不可识别的响应数据');
      }
    }
  }


}//export class end




