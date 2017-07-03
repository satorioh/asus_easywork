import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { AppAvailability } from '@ionic-native/app-availability';
import { Device  } from '@ionic-native/device';
import { Transfer, TransferObject } from '@ionic-native/transfer';
import { File } from '@ionic-native/file';
import { FileOpener } from '@ionic-native/file-opener';



@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
	
  constructor(public navCtrl: NavController,private device: Device,private appAvailability: AppAvailability,private transfer: Transfer, private file: File,private fileOpener: FileOpener) {
  		
  }
  /***************callApp event*********************/
  callApp(e,appID) {
  	let file = this.file;
  	let fileOpener = this.fileOpener
  	let packageName;//e.g.:com.microsoft.office.lync15
  	let appName = e.target.parentElement.textContent.replace(/^\s+|\s+$/g,"");//e.g.:Skype for Business
  	let fatherItem = document.getElementById(appID);
  	const fileTransfer: TransferObject = this.transfer.create();

  /******************platform check*********************/
	if (this.device.platform === 'Android') {
	  	packageName = fatherItem.dataset.android;
	} else if (this.device.platform === 'iOS') {
	  	packageName = 'twitter://';
	}
	const url = encodeURI('http://221.224.163.10:9443/temp/'+ packageName +'.apk');//download url
/****************check if app has installed**************/
	this.appAvailability.check(packageName)
	  .then(
	  	function() {//app has installed
		  	if(confirm('检测到您已安装'+appName+'，是否现在开启？')){
		  		(window as any).startApp.set({"package":packageName}).start();
		  	} else {
		  		//user choose not open app
		  	} 
      	}, 

      	function () {// not installed,start download app
	      	if(confirm('您尚未安装'+appName+'，是否现在下载安装？')){

	      		fileTransfer.onProgress((ProgressEvent) => {//download progress listener
					var percent =  ProgressEvent.loaded / ProgressEvent.total * 100;
     				percent = Math.round(percent);
     				fatherItem.getElementsByTagName('progress')[0].setAttribute('value',percent.toString());
			});

	      		fileTransfer.download(url, file.externalDataDirectory + packageName +'.apk',true)
	      			.then((entry) => {
	    				if(confirm(appName +'下载完成，是否立即安装？')){
	    				var fileURL = entry.toURL();

    			file.checkFile(file.externalDataDirectory, packageName +'.apk').then((entry) =>{//download file exists
    				fileOpener.open(fileURL, 'application/vnd.android.package-archive')
  						.then((entry) => {}//open file success
						,(error) => {alert('开启安装包错误！');})//open file fail		
    				},(error) => {alert('文件无法找到！');})//file.checkFile file not exist	
    			}else{}//user choose not install app now		
    		},(error) => {alert('下载出错！' + error.code);})//fileTransfer.download error
  			} else {}//user choose not download app
		});
  	}//callApp event end
}//HomePage end

