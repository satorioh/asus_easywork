<?php
header("Content-Type:application/json;charset=utf-8");

$uwid = $_REQUEST['uwid'];
$upwd = md5($_REQUEST['upwd']);

include('config.php');
$link = mysqli_connect($db_url,$db_user,$db_pwd,$db_name,$db_port);

$sql = "set names utf8";
mysqli_query($link,$sql);

$sql = "select * from asus_user where uwid='$uwid' and upwd='$upwd'";
$result = mysqli_query($link,$sql);
$list = mysqli_fetch_assoc($result);
echo json_encode($list);
