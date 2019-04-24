/*
 qdeewifi package
*/
//% weight=10 icon="\uf1eb" color=#2896ff
namespace qdeewifi {
    export enum Servos {
        //% block="servo 1"
        Servo1 = 0x01,
        //% block="servo 2"
        Servo2 = 0x02
    }
    export enum ultrasonicPort {
        //% block="Port 1"
        port1 = 0x01,
        //% block="Port 2"
        port2 = 0x02
    }
    export enum busServoPort {
        //% block="Port 10"
        port10 = 0x0A
    }

    export enum WaterPumPort {
        //% block="M1"
        port1 = 0x01,       
        //% block="M2"
        port2 = 0x02  
   }  

    export enum Qdee_MusicName {
        //% block = "stop"
        Stop = 0x00,
        //% block="dadadum"
        Dadadum = 0x01,
        //% block="little star"
        Star = 0x02,
        //% block="ringtone"
        Ring = 0x03,
        //% block="brithday"
        Birth = 0x04,
        //% block="wedding"        
        Wedding = 0x05,
        //% block="jump up"
        JumpUp = 0x06,
        //% block="jump down"
        JumpDown = 0x07,
        //% block="power up"
        PowerUp = 0x08,
        //% block="power down"
        PowerDown = 0x09
    }

    export enum touchKeyPort {
        //% block="Port 1"
        port1 = 0x01,
        //% block="Port 2"
        port2 = 0x02,
        //% block="Port 3"
        port3 = 0x03,
        //% block="Port 6"
        port6 = 0x06,
        //% block="Port 8"
        port8 = 0x08
    }

    export enum LightPort {
        //% block="Port 1"
        port1 = 0x01,
       //% block="Port 6"
        port6 = 0x06,     
       //% block="Port 8"
        port8 = 0x08            
    }
    
    export enum TempSensor { 
        //% block="Port 4"
        port4 = 0x04,       
        //% block="Port 9"
        port9 = 0x09              
    }
    
    export enum Qdee_IOTCmdType {
        //% block="led color"
        LED_COLOR = 1,
        //% block="Buzzer"
        BUZZER = 2,
        //% block="Show"
        SHOW = 3,
        //% block="Shake"
         SHAKE = 4,
        //% block="IR remote"
         IR_REMOTE = 5,
        //% block="Sound level"
         SOUND = 6,
        //% block="Light"
        LIGHT = 7,        
        //% block="Temperature"
        TEMP = 8,
        //% block="Humidity"
         HUMI = 9,
        //% block="Soil humidity"
        SOIL_HUMI = 10,   
        //% block="Ultrasonic"
        ULTRASONIC = 11,
        //% block="Water pump on"
        WATERPUMP_ON = 12,
        //% block="Water pump off"
        WATERPUMP_OFF = 13,
        //% block="Servo control"
        SERVO = 14,      
        //% block="Raindrop"
        RAINDROP = 15,         
        //% block="Infrared monitoring"
        INFRARED = 16            
     }

    export enum Temp_humi {
        //% block="Temperature"
        Temperature = 0x01,
        //% block="Humidity"
        Humidity = 0x02
    }

    export enum avoidSensorPort {
        //% block="Port 1"
        port1 = 0x01,
        //% block="Port 2"
        port2 = 0x02,
        //% block="Port 3"
        port3 = 0x03,        
        //% block="Port 6"
        port6 = 0x06,       
        //% block="Port 8"
        port8 = 0x08
    }

    export enum knobPort {
        //% block="Port 1"
        port1 = 0x01,
        //% block="Port 6"
        port6 = 0x06,
        //% block="Port 8"
        port8 = 0x08
    }

    let versionNum: number = -1;//-1为未定义
    let readTimes: number = 0;

    /**
     * Qdee IoT initialization, please execute at boot time
    */
    //% weight=100 blockId=qdeewifi_Init block="Initialize Qdee IoT"
    //% subcategory=Init
    export function qdeewifi_Init() {
        qdee_initRGBLight();
        qdee_initTempHumiSensor();
        serial.redirect(
            SerialPin.P12,
            SerialPin.P8,
            BaudRate.BaudRate115200);

        basic.forever(() => {
            getHandleCmd();
        });
        while (readTimes < 10 && versionNum == -1) {
            readTimes++;
            sendVersionCmd();
            basic.pause(30)
        }
        basic.pause(1500);
        initExtPins();
    }

    function sendVersionCmd() {
        let buf = pins.createBuffer(4);
        buf[0] = 0x55;
        buf[1] = 0x55;
        buf[2] = 0x02;
        buf[3] = 0x12;//cmd type
        serial.writeBuffer(buf);
    }

    function initExtPins() {
        let buf = pins.createBuffer(6);
        buf[0] = 0x55;
        buf[1] = 0x55;
        buf[2] = 0x04;
        buf[3] = 0x3E;//cmd type
        buf[4] = 0x01;
        buf[5] = 0x00;
        serial.writeBuffer(buf);
    }

    let handleCmd: string = "";
    let currentVoltage: number = 0;
    let volume: number = 0;
    let lhRGBLight: QdeeRGBLight.LHQdeeRGBLight;

    let PA6 = 2;
    let PA7 = 2;
    let PB0 = 2;
    let PB1 = 2;
    let PB10 = 2;
    let PB11 = 2;
    let PC13 = 2;

    let PA6_ad = 0;
    let PA7_ad = 0;
    let PB0_ad = 0;
    let PB1_ad = 0;

    let MESSAGE_HEAD = 0xff;
    let MESSAGE_IOT_HEAD = 0x102;

    let servo1Angle: number = 0xfff;
    let servo2Angle: number = 0xfff;

    /**
    * Get the handle command.
    */
    function getHandleCmd() {
        let charStr: string = serial.readString();
        handleCmd = handleCmd.concat(charStr);
        let cnt: number = countChar(handleCmd, "$");
        if (cnt == 0)
            return;
        let index = findIndexof(handleCmd, "$", 0);
        if (index != -1) {
            let cmd: string = handleCmd.substr(0, index);
            if (cmd.charAt(0).compare("A") == 0)
            {
                if (cmd.length == 13)
                {
                    let arg1Int: number = strToNumber(cmd.substr(1, 2));
                    let arg2Int: number = strToNumber(cmd.substr(3, 2));
                    let arg3Int: number = strToNumber(cmd.substr(5, 2));
                    let arg4Int: number = strToNumber(cmd.substr(7, 2));
                    let arg5Int: number = strToNumber(cmd.substr(9, 2));
                    let arg6Int: number = strToNumber(cmd.substr(11, 2));
    
                    PA6_ad = arg1Int;
                    PA7_ad = arg2Int;
                    PB0_ad = arg3Int;
                    PB1_ad = arg4Int;   
    
                    if (arg5Int != -1)
                    {
                        currentVoltage = arg5Int*10353/200;
                    }  
    
                    if (arg6Int != -1)
                    
                    {
                        volume = arg6Int;
                    }   
                    
                    PA6 = checkADPortValue(arg1Int);
                    PA7 = checkADPortValue(arg2Int);
                    PB0 = checkADPortValue(arg3Int);
                    PB1 = checkADPortValue(arg4Int);
                }
                else if (cmd.length == 9)//彩灯颜色
                {
                    let arg1Int: number = strToNumber(cmd.substr(1, 2));
                    let arg2Int: number = strToNumber(cmd.substr(3, 2));
                    let arg3Int: number = strToNumber(cmd.substr(5, 2));
                    let arg4Int: number = strToNumber(cmd.substr(7, 2));
     
                    control.raiseEvent(MESSAGE_IOT_HEAD, Qdee_IOTCmdType.LED_COLOR);
                    
                    if (arg1Int != -1 && arg2Int != -1 && arg3Int != -1 && arg4Int != -1)
                    {
                        qdee_sendSensorData(Qdee_IOTCmdType.LED_COLOR,arg1Int);
                        qdee_setPixelRGBSerial(arg1Int, arg2Int, arg3Int, arg4Int);   
                    }    
                }
            }  
            else if (cmd.charAt(0).compare("B") == 0)
            {
                if (cmd.length == 16)
                {
                    let arg1Int: number = strToNumber(cmd.substr(1, 2));
                    let arg2Int: number = strToNumber(cmd.substr(3, 2));
                    let arg3Int: number = strToNumber(cmd.substr(5, 2));
                    let arg4Int: number = strToNumber(cmd.substr(7, 2));
                    let arg5Int: number = strToNumber(cmd.substr(9, 4));
                    let arg6Int: number = strToNumber(cmd.charAt(9));
                    let arg7Int: number = strToNumber(cmd.charAt(10));
                    let arg8Int: number = strToNumber(cmd.charAt(11));
                    PA6_ad = arg1Int;
                    PA7_ad = arg2Int;
                    PB0_ad = arg3Int;
                    PB1_ad = arg4Int;
                    PA6 = checkADPortValue(arg1Int);
                    PA7 = checkADPortValue(arg2Int);
                    PB0 = checkADPortValue(arg3Int);
                    PB1 = checkADPortValue(arg4Int);
                    if (arg6Int != -1) {
                        PC13 = arg6Int;
                    }
                    if (arg7Int != -1) {
                        PB11 = arg7Int;
                    }
                    if (arg8Int != -1) {
                        PB10 = arg8Int;
                    }        
                }
                else if (cmd.length == 3)//蜂鸣器
                {
                    let arg1Int: number = strToNumber(cmd.substr(1, 2));
                    if (arg1Int != -1)
                    {
                        control.raiseEvent(MESSAGE_IOT_HEAD, Qdee_IOTCmdType.BUZZER);
                        qdee_sendSensorData(Qdee_IOTCmdType.BUZZER,arg1Int);
                        qdee_playMusic(arg1Int);
                    }     
                }
            }
            if (cmd.charAt(0).compare("C") == 0)
            {
                if (cmd.length == 3)//显示
                {
                    let arg1Int: number = strToNumber(cmd.substr(1, 2));
                    if (arg1Int != -1)
                    {
                        control.raiseEvent(MESSAGE_IOT_HEAD, Qdee_IOTCmdType.SHOW);
                        qdee_sendSensorData(Qdee_IOTCmdType.SHOW,arg1Int);
                        qdee_show_expressions(arg1Int);
                  }    
              }
          }
          else if (cmd.charAt(0).compare("E") == 0)//远程遥控按键
          {
              if (cmd.length == 3)//显示
              {
                  music.playTone(988, music.beat(BeatFraction.Quarter));
                  let arg1Int: number = strToNumber(cmd.substr(1, 2));
                  if (arg1Int != -1)
                  {
                      music.playTone(392, music.beat(BeatFraction.Quarter));
                      control.raiseEvent(MESSAGE_IOT_HEAD, Qdee_IOTCmdType.IR_REMOTE);
                      qdee_sendSensorData(Qdee_IOTCmdType.IR_REMOTE, arg1Int);
                      qdee_send_learn_data(arg1Int);
                  }      
              }
          }
          else if (cmd.charAt(0).compare("F") == 0 && cmd.length == 1)//查询音量
          {
              control.raiseEvent(MESSAGE_IOT_HEAD, Qdee_IOTCmdType.SOUND);
          }
          else if (cmd.charAt(0).compare("G") == 0 && cmd.length == 1)//查询光线
          {
              control.raiseEvent(MESSAGE_IOT_HEAD, Qdee_IOTCmdType.LIGHT);
          }
          else if (cmd.charAt(0).compare("H") == 0 && cmd.length == 1)//查询温度
          {
              control.raiseEvent(MESSAGE_IOT_HEAD, Qdee_IOTCmdType.TEMP);
          }
          else if (cmd.charAt(0).compare("I") == 0 && cmd.length == 1)//查询湿度
          {
              control.raiseEvent(MESSAGE_IOT_HEAD, Qdee_IOTCmdType.HUMI);
          }
          else if (cmd.charAt(0).compare("J") == 0 && cmd.length == 1)//查询土壤湿度
          {
              control.raiseEvent(MESSAGE_IOT_HEAD, Qdee_IOTCmdType.SOIL_HUMI);
          }   
          else if (cmd.charAt(0).compare("K") == 0 && cmd.length == 1)//查询超声波
          {
              control.raiseEvent(MESSAGE_IOT_HEAD, Qdee_IOTCmdType.ULTRASONIC);
         }
        else if (cmd.charAt(0).compare("L") == 0 && cmd.length == 2)//水泵
        {
             let arg1Int: number = strToNumber(cmd.substr(1, 1));
             if (arg1Int != -1)
             {
                 qdee_sendSensorData(Qdee_IOTCmdType.WATERPUMP_ON, arg1Int);
                if (arg1Int == 1)
                 {
                     control.raiseEvent(MESSAGE_IOT_HEAD, Qdee_IOTCmdType.WATERPUMP_ON);
                 }
                 else if (arg1Int == 0)
                 {
                     control.raiseEvent(MESSAGE_IOT_HEAD, Qdee_IOTCmdType.WATERPUMP_OFF);

                 }
             }    
        }    
        else if (cmd.charAt(0).compare("M") == 0 && cmd.length == 11)
        {
            let arg1Int: number = strToNumber(cmd.substr(1, 2));//编号
            let arg2Int: number = strToNumber(cmd.substr(3, 4));//角度
            let arg3Int: number = strToNumber(cmd.substr(7, 4));//时间

            if (arg1Int != -1 && arg2Int != -1 && arg3Int != -1) {
                qdeeiot_setPwmServo(arg1Int, arg2Int, arg3Int);
                control.raiseEvent(MESSAGE_IOT_HEAD, Qdee_IOTCmdType.SERVO);
            }
      }        
      else if (cmd.charAt(0).compare("N") == 0 && cmd.length == 1)//查询雨滴传感器
      {
        control.raiseEvent(MESSAGE_IOT_HEAD, Qdee_IOTCmdType.RAINDROP);
      }
      else if (cmd.charAt(0).compare("O") == 0 && cmd.length == 1)//查询红外门窗监控状态
      {
        control.raiseEvent(MESSAGE_IOT_HEAD, Qdee_IOTCmdType.INFRARED);
      }           
            
        if (cmd.compare("IROK") == 0) {
                music.playTone(988, music.beat(BeatFraction.Quarter));
        }
        if (cmd.charAt(0).compare("V") == 0 && cmd.length == 4) {
                let arg1Int: number = strToNumber(cmd.substr(1, 1));
                let arg2Int: number = strToNumber(cmd.substr(3, 1));
                if (arg1Int != -1 && arg2Int != -1) {
                    versionNum = arg1Int * 10 + arg2Int;
                }
        }
        if (cmd.charAt(0).compare("S") == 0 && cmd.length == 5) {
                let arg1Int: number = strToNumber(cmd.substr(1, 1));
                let arg2Str = cmd.substr(2, 3);
                if (arg2Str.compare("XXX") == 0) {
                    return;
                }
                let arg2Int: number = 0;
                if (arg2Str.charAt(0).compare("F") != 0) {
                    arg2Int = strToNumber(arg2Str);
                }
                if (arg2Int > 1000)
                    arg2Int = 1000;
                if (arg1Int == 1) {
                    servo1Angle = mapRGB(arg2Int, 0, 1000, 0, 240);
                    servo1Angle -= 120;
                }
                else if (arg1Int == 2) {
                    servo2Angle = mapRGB(arg2Int, 0, 1000, 0, 240);
                    servo2Angle -= 120;
                }
            }
        }
        handleCmd = "";
    }

    function checkADPortValue(value: number): number {
        if (value == -1)
            return 2;
        if (value <= 0x2E)
            return 0;
        else if (value >= 0xAA)
            return 1;
        else
            return 2;//未识别电平状态
    }

    function findIndexof(src: string, strFind: string, startIndex: number): number {
        for (let i = startIndex; i < src.length; i++) {
            if (src.charAt(i).compare(strFind) == 0) {
                return i;
            }
        }
        return -1;
    }

    function countChar(src: string, strFind: string): number {
        let cnt: number = 0;
        for (let i = 0; i < src.length; i++) {
            if (src.charAt(i).compare(strFind) == 0) {
                cnt++;
            }
        }
        return cnt;
    }

    function strToNumber(str: string): number {
        let num: number = 0;
        for (let i = 0; i < str.length; i++) {
            let tmp: number = converOneChar(str.charAt(i));
            if (tmp == -1)
                return -1;
            if (i > 0)
                num *= 16;
            num += tmp;
        }
        return num;
    }

    function converOneChar(str: string): number {
        if (str.compare("0") >= 0 && str.compare("9") <= 0) {
            return parseInt(str);
        }
        else if (str.compare("A") >= 0 && str.compare("F") <= 0) {
            if (str.compare("A") == 0) {
                return 10;
            }
            else if (str.compare("B") == 0) {
                return 11;
            }
            else if (str.compare("C") == 0) {
                return 12;
            }
            else if (str.compare("D") == 0) {
                return 13;
            }
            else if (str.compare("E") == 0) {
                return 14;
            }
            else if (str.compare("F") == 0) {
                return 15;
            }
            return -1;
        }
        else
            return -1;
    }

    /**
    * Set the angle of bus servo 1 to 8, range of -120~120 degree
    */
    //% weight=96 blockId=qdeeiot_setBusServo block="Set bus servo|port %port|index %index|angle(-120~120) %angle|duration %duration"
    //% angle.min=-120 angle.max=120
    //% inlineInputMode=inline
    //% subcategory=Control
    export function qdeeiot_setBusServo(port: busServoPort, index: number, angle: number, duration: number) {
        angle = angle * -1;
        if (angle > 120 || angle < -120) {
            return;
        }

        angle += 120;

        let position = mapRGB(angle, 0, 240, 0, 1000);

        let buf = pins.createBuffer(10);
        buf[0] = 0x55;
        buf[1] = 0x55;
        buf[2] = 0x08;
        buf[3] = 0x03;//cmd type
        buf[4] = 0x01;
        buf[5] = duration & 0xff;
        buf[6] = (duration >> 8) & 0xff;
        buf[7] = index;
        buf[8] = position & 0xff;
        buf[9] = (position >> 8) & 0xff;
        serial.writeBuffer(buf);
    }

    /**
    * Set the number of the servo.
    */
    //% weight=94 blockId=qdeeiot_setBusServoNum block="Set bus servo|number %port|"
    //% subcategory=Control
    export function qdeeiot_setBusServoNum(index: number) {
        let buf = pins.createBuffer(5);
        buf[0] = 0x55;
        buf[1] = 0x55;
        buf[2] = 0x03;
        buf[3] = 0x36;//cmd type
        buf[4] = index;
        serial.writeBuffer(buf);
    }

    /**
     * Send read qdee servos angle command
     */
    //% weight=92 blockId=qdeeiot_readAngle block="Read|%servo|angle command "
    //% subcategory=Control
    export function qdeeiot_readAngle(servo: Servos): number {
        let buf = pins.createBuffer(6);
        buf[0] = 0x55;
        buf[1] = 0x55;
        buf[2] = 0x04;
        buf[3] = 0x3E;//cmd type
        buf[4] = 0x05;
        buf[5] = servo;
        serial.writeBuffer(buf);
        basic.pause(200);

        let value = 0;
        if (servo == Servos.Servo1) {
            if (servo1Angle != 0xfff) {
                value = servo1Angle;
                servo1Angle = 0xfff;
                return value;
            }
            else {
                basic.pause(200);
                if (servo1Angle != 0xfff) {
                    value = servo1Angle;
                    servo1Angle = 0xfff;
                    return value;
                }
            }
        }
        else if (servo == Servos.Servo2) {
            if (servo2Angle != 0xfff) {
                value = servo2Angle;
                servo2Angle = 0xfff;
                return value;
            }
            else {
                basic.pause(200);
                if (servo2Angle != 0xfff) {
                    value = servo2Angle;
                    servo2Angle = 0xfff;
                    return value;
                }
            }
        }
        return 0;
    }

     function qdeeiot_setPwmServo(index: number, angle: number, duration: number) {
        let buf = pins.createBuffer(10);
        buf[0] = 0x55;
        buf[1] = 0x55;
        buf[2] = 0x8;
        buf[3] = 0x03;//cmd type
        buf[4] = 0x1;
        buf[5] = duration & 0xff;
        buf[6] = (duration >> 8) & 0xff;
        let position = mapRGB(angle, 0, 270, 500, 2500)
        buf[7] = index;
        buf[8] = position & 0xff;
        buf[9] = (position >> 8) & 0xff;
        serial.writeBuffer(buf);
    }

    /**
    * Set the angle of pwm servo, range of 0~270 degree.Servo num and angles are array type,so you can control multiple servos simultaneously
    */
    //% weight=90 blockId=qdeeiot_setPwmServos block="Set pwm servo|index %index|angle %angle|duration %duration"
    //% inlineInputMode=inline
    //% subcategory=Control
    export function qdeeiot_setPwmServos(index: number[], angle: number[], duration: number) {
        let buf = pins.createBuffer(index.length *3 + 7);
        buf[0] = 0x55;
        buf[1] = 0x55;
        buf[2] = index.length * 3 + 5;
        buf[3] = 0x03;//cmd type
        buf[4] = index.length;
        buf[5] = duration & 0xff;
        buf[6] = (duration >> 8) & 0xff;
        for(let i = 0;i < index.length;i++)
        {
            let position = mapRGB(angle[i], 0, 270, 500, 2500)
            buf[7 + 3 * i] = index[i];
            buf[8 + 3 * i] = position & 0xff;
            buf[9 + 3 * i] = (position >> 8) & 0xff;
        }
        serial.writeBuffer(buf);
    }

    /**
    *	Set the speed of the number 1 motor and number 2 motor, range of -100~100, that can control the tank to go advance or turn of.
    */
    //% weight=89 blockId=qdeeiot_setMotorSpeed block="Set motor1 speed(-100~100)|%speed1|and motor2|speed %speed2"
    //% speed1.min=-100 speed1.max=100
    //% speed2.min=-100 speed2.max=100
    //% subcategory=Control
    export function qdeeiot_setMotorSpeed(speed1: number, speed2: number) {
        if (speed1 > 100 || speed1 < -100 || speed2 > 100 || speed2 < -100) {
            return;
        }
        speed1 = speed1 * -1;
        speed2 = speed2 * -1;
        let buf = pins.createBuffer(6);
        buf[0] = 0x55;
        buf[1] = 0x55;
        buf[2] = 0x04;
        buf[3] = 0x32;//cmd type
        buf[4] = speed2;
        buf[5] = speed1;
        serial.writeBuffer(buf);
    }

    /**
    *	Set the water pump on/off
    */
    //% weight=88 blockId=qdeeiot_setWaterPump block="Set water pump|%port|speed(0~100) %speed|"
    //% speed.min=0 speed.max=100
    //% subcategory=Control
    export function qdeeiot_setWaterPump(port: WaterPumPort, speed: number) {
        if (speed > 100) {
            speed = 100;
        }
        let buf = pins.createBuffer(6);
        buf[0] = 0x55;
        buf[1] = 0x55;
        buf[2] = 0x04;
        buf[3] = 0x32;//cmd type
        if (port == WaterPumPort.port1)
        {
            buf[4] = 0;
            buf[5] = speed;
        }
        else if (port == WaterPumPort.port2)
        {
            buf[4] = speed;
            buf[5] = 0;    
        }
        serial.writeBuffer(buf);
    }

    /**
    * Set the Qdee show facial expressions
    */
    //% weight=86 blockId=qdee_show_expressions block="Qdee show facial expressions %type"
    //% type.min=0 type.max=10
    //% subcategory=Control
    export function qdee_show_expressions(type: number) {
        switch (type)
        {
            case 0:
            basic.showLeds(`
            . . . . .
            . . . . .
            . . . . .
            . . . . .
            . . . . .
            `)
            break;

            case 1:
                basic.showIcon(IconNames.Heart);
                break;
            
            case 2:
                basic.showIcon(IconNames.Yes);
                break;
            
            case 3:
                basic.showIcon(IconNames.No);
                break;
            
            case 4:
                basic.showIcon(IconNames.Happy)
                break;
            
            case 5:
                basic.showIcon(IconNames.Sad)
                break;
            
            case 6:
                basic.showIcon(IconNames.Angry)
                break;
            
            case 7:
            basic.showLeds(`
            . . # . .
            . # # # .
            # . # . #
            . . # . .
            . . # . .
            `)
            break;
            
            case 8:
            basic.showLeds(`
            . . # . .
            . . # . .
            # . # . #
            . # # # .
            . . # . .
            `)
            break;
            
            case 9:
            basic.showLeds(`
            . . # . .
            . # . . .
            # # # # #
            . # . . .
            . . # . .
            `)
                break;
            
            case 10:
            basic.showLeds(`
            . . # . .
            . . . # .
            # # # # #
            . . . # .
            . . # . .
            `)
                break;
            
        }
    }
  /**
     * Set Qdee play tone
     */
    //% weight=84 blockId=qdee_playMusic block="Qdee play song|num %num|"
    //% subcategory=Control
    export function qdee_playMusic(num: Qdee_MusicName) {
        switch (num)
        {
            case Qdee_MusicName.Stop:
                music.playTone(262, music.beat(BeatFraction.Sixteenth));
                break;
            case Qdee_MusicName.Dadadum:
                music.beginMelody(music.builtInMelody(Melodies.Dadadadum), MelodyOptions.Once);
                break;
            
            case Qdee_MusicName.Star:
                music.beginMelody(littleStarMelody(), MelodyOptions.Once)
                break;       
            
            case Qdee_MusicName.Ring:
                music.beginMelody(music.builtInMelody(Melodies.Ringtone), MelodyOptions.Once)
                break;          
            
            case Qdee_MusicName.Birth:
                music.beginMelody(music.builtInMelody(Melodies.Birthday), MelodyOptions.Once)
                break; 
            
            case Qdee_MusicName.Wedding:
                music.beginMelody(music.builtInMelody(Melodies.Wedding), MelodyOptions.Once)
                break; 
            
            case Qdee_MusicName.JumpUp:
                music.beginMelody(music.builtInMelody(Melodies.JumpUp), MelodyOptions.Once)
                break; 
            
            case Qdee_MusicName.JumpDown:
                music.beginMelody(music.builtInMelody(Melodies.JumpDown), MelodyOptions.Once)
                break; 
            
            case Qdee_MusicName.PowerUp:
                music.beginMelody(music.builtInMelody(Melodies.PowerUp), MelodyOptions.Once)
                break; 
            
            case Qdee_MusicName.PowerDown:
                music.beginMelody(music.builtInMelody(Melodies.PowerDown), MelodyOptions.Once)
                break; 
        }
     }

     function littleStarMelody(): string[] {
        return ["C4:4", "C4:4", "G4:4", "G4:4", "A4:4", "A4:4", "G4:4", "F4:4", "F4:4", "E4:4", "E4:4", "D4:4", "D4:4", "C4:4", "G4:4", "G4:4", "F4:4", "F4:4", "E4:4", "E4:4", "D4:4", "G4:4", "G4:4", "F4:4", "F4:4", "E4:4", "E4:4", "D4:4", "C4:4", "C4:4", "G4:4", "G4:4", "A4:4", "A4:4", "G4:4", "F4:4", "F4:4", "E4:4", "E4:4", "D4:4", "D4:4", "C4:4"];
    }
    /**
    * Set ir enter learn mode
    * @param num number of the learn code in 1-10. eg: 1
    */
    //% weight=82 blockId=qdeeiot_ir_learn_mode block="Set ir enter learning mode,code number(1~10) %num|"   
    //% num.min=1 num.max=10    
    //% subcategory=IR
    export function qdeeiot_ir_learn_mode(num: number) {
        if (num < 1 || num > 10)
            return;
        let buf = pins.createBuffer(6);
        buf[0] = 0x55;
        buf[1] = 0x55;
        buf[2] = 0x04;
        buf[3] = 0x3E;//cmd type
        buf[4] = 0x03;
        buf[5] = num - 1;
        serial.writeBuffer(buf);
    }

    /**
    * Let Qdee send ir learn data
    * @param num number of the learn code in 1-10. eg: 1
    */
    //% weight=80 blockId=qdee_send_learn_data block="Let Qdee send ir learning code,code|number(1~10) %num|"
    //% num.min=1 num.max=10  
    //% subcategory=IR
    export function qdee_send_learn_data(num: number) {
        if (num < 1 || num > 10)
            return;
        let buf = pins.createBuffer(8);
        buf[0] = 0x55;
        buf[1] = 0x55;
        buf[2] = 0x06;
        buf[3] = 0x3E;//cmd type
        buf[4] = 0x04;
        buf[5] = 0xFF;
        buf[6] = 0xFF;
        buf[7] = num - 1;
        serial.writeBuffer(buf);
    }


    /**
    * Get the volume level detected by the sound sensor, range 0 to 255
    */
    //% weight=78 blockId=qdeeiot_getSoundVolume block="Sound volume"
    //% subcategory=Sensor
    export function qdeeiot_getSoundVolume(): number {
        return volume;
    }

    /**
     *  Get Qdee current voltage,the unit is mV
    */
    //% weight=76 blockId=qdeeiot_getBatVoltage block="Get Qdee current voltage (mV)"
    //% subcategory=Sensor
    export function qdeeiot_getBatVoltage(): number {
        return currentVoltage;
    }

   
    let distanceBak = 0;
    /**
     * Get the distance of ultrasonic detection to the obstacle 
     */
    //% weight=74 blockId=qdeeiot_ultrasonic  block="Ultrasonic|port %port|distance(cm)"
    //% subcategory=Sensor    
    export function qdeeiot_ultrasonic(port: ultrasonicPort): number {
        let trigPin: DigitalPin = DigitalPin.P1;
        let echoPin: DigitalPin = DigitalPin.P2;
        let distance: number = 0;
        let d: number = 0;
        if (versionNum == -1)//没有读取到版本号
        {
            switch (port) {
                case ultrasonicPort.port1:
                    trigPin = DigitalPin.P1;
                    break;
                case ultrasonicPort.port2:
                    trigPin = DigitalPin.P13;
                    break;
            }
            pins.setPull(trigPin, PinPullMode.PullNone);
            pins.digitalWritePin(trigPin, 0);
            control.waitMicros(2);
            pins.digitalWritePin(trigPin, 1);
            control.waitMicros(10);
            pins.digitalWritePin(trigPin, 0);

            d = pins.pulseIn(trigPin, PulseValue.High, 15000);
            distance = d;
            // filter timeout spikes
            if (distance == 0 || distance >= 13920) {
                distance = distanceBak;
            }
            else
                distanceBak = d;

        }
        else {
            switch (port) {
                case ultrasonicPort.port1:
                    trigPin = DigitalPin.P1;
                    echoPin = DigitalPin.P2;
                    break;
                case ultrasonicPort.port2:
                    trigPin = DigitalPin.P13;
                    echoPin = DigitalPin.P14;
                    break;
            }
            pins.setPull(echoPin, PinPullMode.PullNone);
            pins.setPull(trigPin, PinPullMode.PullNone);

            // send pulse
            pins.digitalWritePin(trigPin, 0);
            control.waitMicros(2);
            pins.digitalWritePin(trigPin, 1);
            control.waitMicros(10);
            pins.digitalWritePin(trigPin, 0);
            // read pulse
            d = pins.pulseIn(echoPin, PulseValue.High, 15000);
            distance = d;
            // filter timeout spikes
            if (distance == 0 || distance >= 13920) {
                distance = distanceBak;
            }
            else
                distanceBak = d;
        }

        return Math.round(distance * 10 / 6 / 58);
    }

    /**
     * Get light level
     */
    //% weight=72 blockId=qdeeiot_getLightLevel block="Get|%port|light level(0~255)"
    //% subcategory=Sensor     
    export function qdeeiot_getLightLevel(port: LightPort): number
    {
        let value = 0;
        switch (port)
        {
            case LightPort.port1:
                value = pins.analogReadPin(AnalogPin.P1);
                value = mapRGB(value, 0, 1023, 0, 255);
                break;
            
            case LightPort.port6:
                value = PA6_ad;
                break;
            
            case LightPort.port8:
                value = PB0_ad;
                break;
        }
        return Math.round(255-value);
    }

    /**
     * Get soil humidity
     */
    //% weight=70 blockId="qdeeiot_getsoilhumi" block="Qdee|port %port|get soil humidity"
    //% subcategory=Sensor     
    export function qdeeiot_getsoilhumi(port: LightPort): number {
        let value: number = 0;
        if (port == LightPort.port1) {
            value = pins.analogReadPin(AnalogPin.P1);
            value = mapRGB(value, 0, 1023, 0, 100);
        }
        else if (port == LightPort.port6) {
            value = PA6_ad;
            value = mapRGB(value, 0, 255, 0, 100);
        }
        else if (port == LightPort.port8) {
            value = PB0_ad;
            value = mapRGB(value, 0, 255, 0, 100);
        }
        return Math.round(value);
    }


    /**
     * Get soil humidity
     */
    //% weight=68 blockId="qdeeiot_waterdrop" block="Qdee|port %port|get water drop sensor ad(0~255)"
    //% subcategory=Sensor     
    export function qdeeiot_waterdrop(port: LightPort): number {
        let value: number = 0;
        if (port == LightPort.port1) {
            value = pins.analogReadPin(AnalogPin.P1);
            value = mapRGB(value, 0, 1023, 0, 255);
        }
        else if (port == LightPort.port6) {
            value = PA6_ad;
        }
        else if (port == LightPort.port8) {
            value = PB0_ad;
        }
        return Math.round(value);
    }

      /**
     * Get flame ad value,the bigger the value, the bigger the flame
     */
    //% weight=66 blockId="qdeeiot_flame" block="Qdee|port %port|get flame sensor ad(0~255)"
    //% subcategory=Sensor     
    export function qdeeiot_flame(port: LightPort): number {
        let value: number = 0;
        if (port == LightPort.port1) {
            value = pins.analogReadPin(AnalogPin.P1);
            value = mapRGB(value, 0, 1023, 0, 255);
        }
        else if (port == LightPort.port6) {
            value = PA6_ad;
        }
        else if (port == LightPort.port8) {
            value = PB0_ad;
        }
        return Math.round(value);
    }  

/**
* Get the obstacle avoidance sensor status,1 detect obstacle,0 no detect obstacle
*/   
   //% weight=64 blockId=qdee_avoidSensor block="Obstacle avoidance sensor|port %port|detect obstacle"
   //% subcategory=Sensor    
   export function qdee_avoidSensor(port: avoidSensorPort): number {
    let status = 0;
    let flag: number = 0;
    switch (port)
    {
        case avoidSensorPort.port1:
            pins.setPull(DigitalPin.P1, PinPullMode.PullUp);
            status = pins.digitalReadPin(DigitalPin.P1);
            break;
        case avoidSensorPort.port2:
            pins.setPull(DigitalPin.P13, PinPullMode.PullUp);
            status = pins.digitalReadPin(DigitalPin.P13);
            break;
        case avoidSensorPort.port3:
            pins.setPull(DigitalPin.P16, PinPullMode.PullUp);
            status = pins.digitalReadPin(DigitalPin.P16);
            break;
        case avoidSensorPort.port6:
            status = PA6;
            break;
        case avoidSensorPort.port8:
            status = PB0;
            break;
    }   
    if (status == 1)
        flag = 0;
    else
        flag = 1;
    return flag;
    }
    
    /**
    * Get the ad value of the knob moudule
    */
    //% weight=63 blockId=qdee_getKnobValue block="Get knob|port %port|value(0~255)"
    //% subcategory=Sensor    
    export function qdee_getKnobValue(port: knobPort): number {
        let adValue = 0;
        switch (port) {
            case knobPort.port1:
                adValue = pins.analogReadPin(AnalogPin.P1);
                adValue = adValue * 255 / 1023;
                break;
            case knobPort.port6:
                adValue = PA6_ad;
                break;
            case knobPort.port8:
                adValue = PB0_ad;
                break;
        }
        return adValue;
    }

    /**
    * Get the condition of the touch button,press return 1,or return 0
    */
    //% weight=62 blockId=qdee_touchButton block=" Touch button|port %port|is pressed"    
    //% subcategory=Sensor    
    export function qdee_touchButton(port: touchKeyPort): boolean {
        let status: boolean = false;
        switch (port) {
            case touchKeyPort.port1:
                pins.setPull(DigitalPin.P1, PinPullMode.PullUp);
                status = !pins.digitalReadPin(DigitalPin.P1);
                break;
            case touchKeyPort.port2:
                pins.setPull(DigitalPin.P13, PinPullMode.PullUp);
                status = !pins.digitalReadPin(DigitalPin.P13);
                break;
            case touchKeyPort.port3:
                pins.setPull(DigitalPin.P16, PinPullMode.PullUp);
                status = !pins.digitalReadPin(DigitalPin.P16);
                break;
            case touchKeyPort.port6:
                status = !PA6;
                break;
            case touchKeyPort.port8:
                status = !PB0;
                break;
        }
        return status;
    }

    let ATH10_I2C_ADDR = 0x38;


    function temp_i2cwrite(value: number): number {
        let buf = pins.createBuffer(3);
        buf[0] = value >> 8;
        buf[1] = value & 0xff;
        buf[2] = 0;
        basic.pause(80);
        let rvalue = pins.i2cWriteBuffer(ATH10_I2C_ADDR, buf);
        // serial.writeString("writeback:");
        // serial.writeNumber(rvalue);
        // serial.writeLine("");
        return rvalue;
    }

    function temp_i2cread(bytes: number): Buffer {
        let val = pins.i2cReadBuffer(ATH10_I2C_ADDR, bytes);
        return val;
    }

    function qdee_initTempHumiSensor(): boolean {
        for (let i = 0; i < 10; i++) {
            if (qdee_GetInitStatus()) {
                return true;
            }
            basic.pause(500);
        }
       // serial.writeString("init erro");
        return false;
    }

    function qdee_GetInitStatus(): boolean {
        temp_i2cwrite(0xe108);
        let value = temp_i2cread(1);
        if ((value[0] & 0x68) == 0x08)
            return true;
        else
            return false;
    }

    function qdee_getAc() {
        temp_i2cwrite(0xac33);
        basic.pause(100)
        let value = temp_i2cread(1);
        for (let i = 0; i < 100; i++) {
            if ((value[0] & 0x80) != 0x80) {
                basic.pause(20)
            }
            else
                break;
        }
    }

    function readTempHumi(select: Temp_humi): number {
        while (!qdee_GetInitStatus()) {
            basic.pause(30);
        }
        qdee_getAc();
        let buf = temp_i2cread(6);
        if (buf.length != 6) {
            // serial.writeLine("444444")
            return 0;
        }
        let humiValue: number = 0;
        humiValue = (humiValue | buf[1]) << 8;
        humiValue = (humiValue | buf[2]) << 8;
        humiValue = humiValue | buf[3];
        humiValue = humiValue >> 4;

        let tempValue: number = 0;
        tempValue = (tempValue | buf[3]) << 8;
        tempValue = (tempValue | buf[4]) << 8;
        tempValue = tempValue | buf[5];
        tempValue = tempValue & 0xfffff;

        if (select == Temp_humi.Temperature) {
            tempValue = tempValue * 200 * 10 / 1024 / 1024 - 500;
            return Math.round(tempValue);
        }
        else {
            humiValue = humiValue * 1000 / 1024 / 1024;
            return Math.round(humiValue);
        }
    }

    /**
      * Get sensor temperature and humidity
      */
    //% weight=60 blockId="qdeeiot_gettemperature" block="Qdee|port %port|get %select"
    //% subcategory=Sensor     
    export function qdeeiot_gettemperature(port: TempSensor, select: Temp_humi): number {
        return readTempHumi(select);
    }

/**
        * Do someting when Qdee receive remote-control code
        * @param code the ir key button that needs to be pressed
        * @param body code to run when event is raised
        */
   //% weight=58 blockId=onQdeeGetCmd block="on Qdee get|%code|Command"
   //% subcategory=Data  
   export function onQdeeGetCmd(code: Qdee_IOTCmdType, body: Action) {
       control.onEvent(MESSAGE_IOT_HEAD, code, body);
   }

   /**
    * Send sensor data 
    * 
    */
   //% weight=56 blockId="qdee_sendSensorData" block="Send|%cmd|sensor data %data"
  //% subcategory=Data
   export function qdee_sendSensorData(cmd: Qdee_IOTCmdType, data: number) {
       let cmdStr: string;
       switch (cmd) {
           case Qdee_IOTCmdType.LED_COLOR:
               cmdStr = "A";
               break;
           case Qdee_IOTCmdType.BUZZER:
               cmdStr = "B";
               break;
           case Qdee_IOTCmdType.SHOW:
               cmdStr = "C";
               break;
           case Qdee_IOTCmdType.SHAKE:
               cmdStr = "D";
               break;  
           case Qdee_IOTCmdType.IR_REMOTE:
               cmdStr = "E";
               break;  
           case Qdee_IOTCmdType.SOUND:
               cmdStr = "F";
               break;
           case Qdee_IOTCmdType.LIGHT:
               cmdStr = "G";
               break;
           case Qdee_IOTCmdType.TEMP:
               cmdStr = "H";
               break;
           case Qdee_IOTCmdType.HUMI:
               cmdStr = "I";
               break;
           case Qdee_IOTCmdType.SOIL_HUMI:
               cmdStr = "J";
               break;
           case Qdee_IOTCmdType.ULTRASONIC:
               cmdStr = "K";
               break;
           case Qdee_IOTCmdType.WATERPUMP_ON:
           case Qdee_IOTCmdType.WATERPUMP_OFF:
               cmdStr = "L";
               break;
           case Qdee_IOTCmdType.SERVO:
                cmdStr = "M";
               break;   
           case Qdee_IOTCmdType.RAINDROP:
               cmdStr = "N";
               break;    
            case Qdee_IOTCmdType.INFRARED:
               cmdStr = "O";
               break;            
       }
       cmdStr += data.toString();
       cmdStr += "$";

       let buf = pins.createBuffer(cmdStr.length + 5);
       buf[0] = 0x55;
       buf[1] = 0x55;
       buf[2] = (cmdStr.length + 3) & 0xff;
       buf[3] = 0x3E;//cmd type
       buf[4] = 0x09;
       for (let i = 0; i < cmdStr.length; i++) {
           buf[5 + i] = cmdStr.charCodeAt(i);
       }
       serial.writeBuffer(buf);
    }
    
    function mapRGB(x: number, in_min: number, in_max: number, out_min: number, out_max: number): number {
        return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
    }
    /**
	 * Initialize RGB
	 */
    function qdee_initRGBLight() {
        if (!lhRGBLight) {
            lhRGBLight = QdeeRGBLight.create(DigitalPin.P15, 6, QdeeRGBPixelMode.RGB);
        }
        qdee_clearLight();
    }

    /**
         * Set the brightness of the strip. This flag only applies to future operation.
         * @param brightness a measure of LED brightness in 0-255. eg: 255
    */
    //% blockId="qdee_setBrightness" block="set brightness %brightness"
    //% weight=54
    //% subcategory=Coloured_lights
    export function qdee_setBrightness(brightness: number): void {
        lhRGBLight.setBrightness(brightness);
    }
    
    /**
     * Set the color of the colored lights, after finished the setting please perform  the display of colored lights.
     */
    //% weight=52 blockId=qdee_setPixelRGB block="Set|%lightoffset|color to %rgb"
    //% subcategory=Coloured_lights    
    export function qdee_setPixelRGB(lightoffset: QdeeLights, rgb: QdeeRGBColors) {
        lhRGBLight.setPixelColor(lightoffset, rgb);
    }
    
    /**
     * Set RGB Color argument
     */
    //% weight=50 blockId=qdee_setPixelRGBArgs block="Set|%lightoffset|color to %rgb"
    //% subcategory=Coloured_lights    
    export function qdee_setPixelRGBArgs(lightoffset: QdeeLights, rgb: number) {
        lhRGBLight.setPixelColor(lightoffset, rgb);
    }

    /**
     * Display the colored lights, and set the color of the colored lights to match the use. After setting the color of the colored lights, the color of the lights must be displayed.
     */
    //% weight=48 blockId=qdee_showLight block="Show light"
    //% subcategory=Coloured_lights    
    export function qdee_showLight() {
        lhRGBLight.show();
    }

    function qdee_setPixelRGBSerial(lightoffset: number, r: number, g: number, b: number) {
        lhRGBLight.setPixelColorRGB(lightoffset, r, g, b);
    }


    /**
     * Clear the color of the colored lights and turn off the lights.
     */
    //% weight=46 blockGap=50 blockId=qdee_clearLight block="Clear light"
    //% subcategory=Coloured_lights    
    export function qdee_clearLight() {
        lhRGBLight.clear();
    }
}
