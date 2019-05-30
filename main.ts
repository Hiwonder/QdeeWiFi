
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
        INFRARED = 16,
        //% block="Bus Servo"
        BUSSERVO = 17,
        //% block="Motor run"
        MOTOR = 18,
        //% block="Sensor data"
        SENSOR = 19,
        //% block="Sensor stop"
        SENSOR_OFF = 20,
        //% block="Fan"
        FAN = 21,       
        //% block="digital tube"
        DIGITAL_TUBE = 22,
        //% block="light belt"
        LIGHT_BELT = 23
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

    export enum lightbeltPort {
        //% block="Port 1"
        port1 = 0x01,
        //% block="Port 2"
        port2 = 0x02,
        //% block="Port 3"
        port3 = 0x03
    }

    let versionNum: number = -1;//-1为未定义
    let readTimes: number = 0;

    const INVALID_PORT = 0xff;
    let ultraPort = INVALID_PORT;
    let lightPort = INVALID_PORT;
    let soilHumiPort = INVALID_PORT;
    let rainDropPort = INVALID_PORT;
    let avoidPort = INVALID_PORT;
    let fanPort = INVALID_PORT;
    let waterpumPort = INVALID_PORT;

    let Digitaltube:TM1640LEDs
    let TM1640_CMD1 = 0x40;
    let TM1640_CMD2 = 0xC0;
    let TM1640_CMD3 = 0x80;
    let _SEGMENTS = [0x3F, 0x06, 0x5B, 0x4F, 0x66, 0x6D, 0x7D, 0x07, 0x7F, 0x6F, 0x77, 0x7C, 0x39, 0x5E, 0x79, 0x71];

    /**
     * Qdee IoT initialization, please execute at boot time
    */
    //% weight=100 blockId=qdeewifi_Init block="Initialize Qdee IoT"
    //% subcategory=Init
    export function qdeewifi_Init() {
        qdee_initRGBLight();
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

    /**
     * Qdee temperature and humidity sensor initialization, please execute at boot time
    */
    //% weight=99 blockId=qdeewifi_temphumi_init block="Initialize Qdee temperature and humidity sensor at port %port"
    //% subcategory=Init
    export function qdeewifi_temphumi_init(port: TempSensor) {
        qdee_initTempHumiSensor();
    }
    /**
     * Qdee ultrasonic initialization, please execute at boot time
    */
    //% weight=98 blockId=qdeewifi_ultrasonic_init block="Initialize Qdee ultrasonic sensor %port"
    //% subcategory=Init
    export function qdeewifi_ultrasonic_init(port: ultrasonicPort) {
        ultraPort = port;
    }

    /**
     * Qdee light sensor initialization, please execute at boot time
    */
    //% weight=97 blockId=qdeewifi_lightSensor_init block="Initialize Qdee light sensor %port"
    //% subcategory=Init
    export function qdeewifi_lightSensor_init(port: LightPort) {
        lightPort = port;
    }

    /**
     * Qdee soil humidity sensor initialization, please execute at boot time
    */
    //% weight=96 blockId=qdeewifi_soilHumi_init block="Initialize Qdee soil humidity sensor %port"
    //% subcategory=Init
    export function qdeewifi_soilHumi_init(port: LightPort) {
        soilHumiPort = port;
    }

    /**
     * Qdee raindrop sensor initialization, please execute at boot time
    */
    //% weight=95 blockId=qdeewifi_raindrop_init block="Initialize Qdee rain drop sensor %port"
    //% subcategory=Init
    export function qdeewifi_raindrop_init(port: LightPort) {
        rainDropPort = port;
    }

    /**
     * Qdee avoid obstacle sensor initialization, please execute at boot time
    */
    //% weight=94 blockId=qdeewifi_avoidobstacle_init block="Initialize Qdee avoid obstacle sensor %port"
    //% subcategory=Init
    export function qdeewifi_avoidobstacle_init(port: avoidSensorPort) {
        avoidPort = port;
    }

    /**
     * @param clk the CLK pin for TM1640, eg: DigitalPin.P1
     * @param dio the DIO pin for TM1640, eg: DigitalPin.P2
     * @param intensity the brightness of the LED, eg: 7
     * @param count the count of the LED, eg: 4
     */
    //% weight=93 blockId=qdee_digitaltube block="Initialize digitaltube|%port|intensity %intensity|LED count %count"
    //% subcategory=Init
    export function qdee_digitaltube(port: ultrasonicPort, intensity: number, count: number) {
        Digitaltube = qdee_TM1640create(port, intensity, count);
    }

    /**
     * Fan port initialization, please execute at boot time
     */
    //% weight=92 blockId=qdee_initfanPort block="Initialize fan %port"
    //% subcategory=Init
    export function qdee_initfanPort(port: ultrasonicPort) {
        fanPort = port;
    }
    /**
     * Pwm servo port initialization, please execute at boot time
     */
    //% weight=91 blockId=qdee_initPwmServo block="Initialize pwm servo %port"
    //% subcategory=Init
    export function qdee_initPwmServo(port: busServoPort) {
    }

    /**
     * Waterpump initialization, please execute at boot time
     */
    //% weight=90 blockId=qdee_initWaterpump block="Initialize waterpump %port"
    //% subcategory=Init
    export function qdee_initWaterpump(port: WaterPumPort) {
        waterpumPort = port;
    }

    let lhRGBLightBelt: QdeeRGBLight.LHQdeeRGBLight;

    /**
	 * Initialize Light belt
	 */
    //% weight=89 blockId=qdee_belt_initRGBLight block="Initialize light belt at port %port"
    //% subcategory=Init
    export function qdee_belt_initRGBLight(port: lightbeltPort) {
        switch (port) {
            case lightbeltPort.port1:
                if (!lhRGBLightBelt) {
                    lhRGBLightBelt = QdeeRGBLight.create(DigitalPin.P1, 15, QdeeRGBPixelMode.RGB);
                }
                break;
            case lightbeltPort.port2:
                if (!lhRGBLightBelt) {
                    lhRGBLightBelt = QdeeRGBLight.create(DigitalPin.P13, 15, QdeeRGBPixelMode.RGB);
                }
                break;
            case lightbeltPort.port3:
                if (!lhRGBLightBelt) {
                    lhRGBLightBelt = QdeeRGBLight.create(DigitalPin.P16, 15, QdeeRGBPixelMode.RGB);
                }
                break;
        }
        qdee_clearLight();
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
    let fanSpeed: number = 0;

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

    let sensorList: number[] = [];

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
                        currentVoltage = Math.round(arg5Int*10353/200);
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
      else if(cmd.charAt(0).compare("Q") == 0 && cmd.length == 5)
      {
            let arg1Int: number = strToNumber(cmd.substr(1, 2));//速度1
            let arg2Int: number = strToNumber(cmd.substr(3, 2));//速度2    
            qdeeiot_setMotorSpeed(arg1Int - 100, arg2Int - 100);    
            control.raiseEvent(MESSAGE_IOT_HEAD, Qdee_IOTCmdType.MOTOR);
      } 
      else if (cmd.charAt(0).compare("R") == 0) {
        sensorList = [];
        let arg1Int: number = strToNumber(cmd.substr(1, 2));
        if (arg1Int == 0) {
            qdee_sendSensorData(Qdee_IOTCmdType.SENSOR, 0);
            control.raiseEvent(MESSAGE_IOT_HEAD, Qdee_IOTCmdType.SENSOR_OFF);
        }
        else {
            let sensorCount = (cmd.length - 1) / 2;
            for (let i = 0; i < sensorCount; i++) {
                sensorList.insertAt(i, strToNumber(cmd.substr(i * 2 + 1, 2)))
                control.raiseEvent(MESSAGE_IOT_HEAD, Qdee_IOTCmdType.SENSOR);
                }
            }
        }
        else if (cmd.charAt(0).compare("T") == 0) {
            let argInt: number = strToNumber(cmd.substr(1, 2));//速度
            if (argInt != -1) {
                    fanSpeed = argInt - 100
                    control.raiseEvent(MESSAGE_IOT_HEAD, Qdee_IOTCmdType.FAN);
            }
        } 
        else if (cmd.charAt(0).compare("U") == 0) {
            let arg2Int: number = strToNumber(cmd.substr(1, 4));//数码管数值
            let arg3Int: number = strToNumber(cmd.substr(5, 1));//小数点位置
            if (arg2Int != -1 && arg3Int != -1) {
                qdee_showNumber(arg2Int);
                if (arg3Int != 5)
                {
                    if (arg3Int == 6)
                    {
                        qdeeiot_digitaltube_clear();
                    }
                    else
                        qdee_digitaltube_showDP(arg3Int, true);
                }    
            }                
        }
        else if (cmd.charAt(0).compare("V") == 0)
        {
            let arg1Int: number = strToNumber(cmd.substr(1, 2));
            let arg2Int: number = strToNumber(cmd.substr(3, 2));
            let arg3Int: number = strToNumber(cmd.substr(5, 2));
            let arg4Int: number = strToNumber(cmd.substr(7, 2));
     
            control.raiseEvent(MESSAGE_IOT_HEAD, Qdee_IOTCmdType.LIGHT_BELT);
               
            if (arg1Int != -1 && arg2Int != -1 && arg3Int != -1 && arg4Int != -1)
            {
                qdee_sendSensorData(Qdee_IOTCmdType.LIGHT_BELT,arg1Int);
                qdee_belt_setPixelRGBSerial(arg1Int, arg2Int, arg3Int, arg4Int);   
            }   
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
    //% weight=88 blockId=qdeeiot_setPwmServos block="Set pwm servo|index %index|angle %angle|duration %duration"
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
    //% weight=87 blockId=qdeeiot_setMotorSpeed block="Set motor1 speed(-100~100)|%speed1|and motor2|speed %speed2"
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
    //% weight=86 blockId=qdeeiot_setWaterPump block="Set water pump speed(0~100) %speed"
    //% speed.min=0 speed.max=100
    //% subcategory=Control
    export function qdeeiot_setWaterPump(speed: number) {
        if (waterpumPort == INVALID_PORT)
            return;
        if (speed > 100) {
            speed = 100;
        }
        let buf = pins.createBuffer(6);
        buf[0] = 0x55;
        buf[1] = 0x55;
        buf[2] = 0x04;
        buf[3] = 0x32;//cmd type
        if (waterpumPort == WaterPumPort.port1)
        {
            buf[4] = 0;
            buf[5] = speed;
        }
        else if (waterpumPort == WaterPumPort.port2)
        {
            buf[4] = speed;
            buf[5] = 0;    
        }
        serial.writeBuffer(buf);
    }

    /**
    * Set the Qdee show facial expressions
    */
    //% weight=85 blockId=qdee_show_expressions block="Qdee show facial expressions %type"
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
            case 1:basic.showIcon(IconNames.Heart);break;
            case 2:basic.showIcon(IconNames.Yes);break;
            case 3:basic.showIcon(IconNames.No);break;
            case 4: basic.showIcon(IconNames.Happy);break;
            case 5: basic.showIcon(IconNames.Sad);break;
            case 6: basic.showIcon(IconNames.Angry);break;
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
     * Get phone command set fan speed
     */
    //% weight=84 blockId=qdee_getFanSpeedSet block="Qdee get fan speed"
    //% subcategory=Control
    export function qdee_getFanSpeedSet(): number {
        return fanSpeed;
    }
    /**
    *	Set the speed of the fan, range of -100~100.
    */
    //% weight=83 blockId=qdeewifi_setFanSpeed block="Set fan speed(-100~100) %speed1"
    //% speed1.min=-100 speed1.max=100
    //% subcategory=Control
    export function qdeewifi_setFanSpeed(speed1: number) {
        if (fanPort == INVALID_PORT)
            return;
        if (speed1 > 100 || speed1 < -100) {
            return;
        }
        let pin1 = AnalogPin.P1;
        let pin2 = AnalogPin.P2;

        if (fanPort == ultrasonicPort.port2) {
            pin1 = AnalogPin.P13;
            pin2 = AnalogPin.P14;
        }
        if (speed1 < 0) {
            pins.analogWritePin(pin2, 0);
            pins.analogWritePin(pin1, pins.map(-speed1, 0, 100, 0, 1023));
        }
        else if (speed1 > 0) {
            pins.analogWritePin(pin1, 0);
            pins.analogWritePin(pin2, pins.map(speed1, 0, 100, 0, 1023));
        }
        else {
            pins.analogWritePin(pin2, 0);
            pins.analogWritePin(pin1, 0);
        }
    }
    /**
    * TM1640 LED display
    */
       export class TM1640LEDs {
        buf: Buffer;
        clk: DigitalPin;
        dio: DigitalPin;
        _ON: number;
        brightness: number;
        count: number;  // number of LEDs
        /**
         * initial TM1640
         */
        init(): void {
            pins.digitalWritePin(this.clk, 0);
            pins.digitalWritePin(this.dio, 0);
            this._ON = 8;
            this.buf = pins.createBuffer(this.count);
            this.clear();
        }
        /**
         * Start 
         */
        _start() {
            pins.digitalWritePin(this.dio, 0);
            pins.digitalWritePin(this.clk, 0);
        }
        /**
         * Stop
         */
        _stop() {
            pins.digitalWritePin(this.dio, 0);
            pins.digitalWritePin(this.clk, 1);
            pins.digitalWritePin(this.dio, 1);
        }
        /**
         * send command1
         */
        _write_data_cmd() {
            this._start();
            this._write_byte(TM1640_CMD1);
            this._stop();
        }
        /**
         * send command3
         */
        _write_dsp_ctrl() {
            this._start();
            this._write_byte(TM1640_CMD3 | this._ON | this.brightness);
            this._stop();
        }
        /**
         * send a byte to 2-wire interface
         */
        _write_byte(b: number) {
            for (let i = 0; i < 8; i++) {
                pins.digitalWritePin(this.clk, 0);
                pins.digitalWritePin(this.dio, (b >> i) & 1);
                pins.digitalWritePin(this.clk, 1);

            }
            pins.digitalWritePin(this.clk, 1);
            pins.digitalWritePin(this.clk, 0);
        }
        /**
         * set data to TM1640, with given bit
         */
        _dat(bit: number, dat: number) {
            this._write_data_cmd();
            this._start();
            this._write_byte(TM1640_CMD2 | (bit % this.count))
            this._write_byte(dat);
            this._stop();
            this._write_dsp_ctrl();
        }
        showbit(num: number = 5, bit: number = 0) {
            this.buf[bit % this.count] = _SEGMENTS[num % 16]
            this._dat(bit, _SEGMENTS[num % 16])
        }
        showNumber(num: number) {
            if (num < 0) {
                this._dat(0, 0x40) // '-'
                num = -num
            }
            else
            {
                let arg1 = Math.idiv(num, 1000) % 10;
                let arg2 = Math.idiv(num, 100) % 10;
                let arg3 = Math.idiv(num, 10) % 10;
                let arg4 = num % 10;
                if (arg1 != 0)
                {
                    this.showbit(arg1);
                    this.showbit(arg2, 1);
                    this.showbit(arg3,2);
                }
                else
                {
                    if (arg2 != 0)
                    {
                        this.showbit(arg2, 1);
                        this.showbit(arg3,2);
                    }
                    else
                    {
                        if (arg3 != 0)
                            this.showbit(arg3,2); 
                    }
                }
                this.showbit(arg4, 3);
            }   
        }
        showDP(bit: number = 1, show: boolean = true) {
            bit = bit % this.count
            if (show) this._dat(bit, this.buf[bit] | 0x80)
            else this._dat(bit, this.buf[bit] & 0x7F)
        }
        clear() {
            for (let i = 0; i < this.count; i++) {
                this._dat(i, 0)
                this.buf[i] = 0
            }
        }
        on() {
            this._ON = 8;
            this._write_data_cmd();
            this._write_dsp_ctrl();
        }
        off() {
            this._ON = 0;
            this._write_data_cmd();
            this._write_dsp_ctrl();
        }
    }
    function qdee_TM1640create(port: ultrasonicPort, intensity: number, count: number): TM1640LEDs {
        let digitaltube = new TM1640LEDs();
        switch (port) {
            case ultrasonicPort.port1:
                digitaltube.clk = DigitalPin.P2;
                digitaltube.dio = DigitalPin.P1;
                break;
            case ultrasonicPort.port2:
                digitaltube.clk = DigitalPin.P14;
                digitaltube.dio = DigitalPin.P13;
                break;
        }
        if ((count < 1) || (count > 5)) count = 4;
        digitaltube.count = count;
        digitaltube.brightness = intensity;
        digitaltube.init();
        return digitaltube;
    }

    /**
     * show a number. 
     * @param num is a number, eg: 0
     */
    //% weight=82 blockId=qdee_showNumber block="Digitaltube show number %num"
    //% subcategory=Control
    export function qdee_showNumber(num: number) {
        Digitaltube.clear();
        Digitaltube.showNumber(num);
    }
    /**
     * show or hide dot point. 
     * @param bit is the position, eg: 1
     * @param show is show/hide dp, eg: true
     */
    //% weight=81 blockId=qdee_digitaltube_showDP block="Digitaltube show dotPoint at|%bit|show %show"
    //% subcategory=Control 
    export function qdee_digitaltube_showDP(bit: number = 1, show: boolean = true) {
        Digitaltube.showDP(bit, show);
    } 
    /**
     * clear LED. 
     */
    //% weight=80 blockId=qdeeiot_digitaltube_clear block="Clear digitaltube"
    //% subcategory=Control    
    export function qdeeiot_digitaltube_clear() {
        Digitaltube.clear();
    }  
    /**
    * Set ir enter learn mode
    * @param num number of the learn code in 1-10. eg: 1
    */
    //% weight=79 blockId=qdeeiot_ir_learn_mode block="Set ir enter learning mode,code number(1~10) %num|"   
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
    //% weight=78 blockId=qdee_send_learn_data block="Let Qdee send ir learning code,code|number(1~10) %num|"
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
    //% weight=77 blockId=qdeeiot_getSoundVolume block="Sound volume"
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
    //% weight=74 blockId=qdeeiot_ultrasonic  block="Ultrasonic distance(cm)"
    //% subcategory=Sensor    
    export function qdeeiot_ultrasonic(): number {
        if (ultraPort == INVALID_PORT)
            return 0;
        let trigPin: DigitalPin = DigitalPin.P1;
        let echoPin: DigitalPin = DigitalPin.P2;
        let distance: number = 0;
        let d: number = 0;

        switch (ultraPort) {
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
        return Math.round(distance * 10 / 6 / 58);
    }
    /**
     * Get light level
     */
    //% weight=72 blockId=qdeeiot_getLightLevel block="Get light level(0~255)"
    //% subcategory=Sensor     
    export function qdeeiot_getLightLevel(): number
    {
        if (lightPort == INVALID_PORT)
            return 0;
        let value = 0;
        switch (lightPort)
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
    //% weight=70 blockId="qdeeiot_getsoilhumi" block="Qdee get soil humidity"
    //% subcategory=Sensor     
    export function qdeeiot_getsoilhumi(): number {
        if (soilHumiPort == INVALID_PORT)
            return 0;
        let value: number = 0;
        if (soilHumiPort == LightPort.port1) {
            value = pins.analogReadPin(AnalogPin.P1);
            value = mapRGB(value, 0, 1023, 0, 100);
        }
        else if (soilHumiPort == LightPort.port6) {
            value = PA6_ad;
            value = mapRGB(value, 0, 255, 0, 100);
        }
        else if (soilHumiPort == LightPort.port8) {
            value = PB0_ad;
            value = mapRGB(value, 0, 255, 0, 100);
        }
        return Math.round(value);
    }
    /**
     * Get soil humidity
     */
    //% weight=68 blockId="qdeeiot_raindrop" block="Qdee get rain drop sensor ad value(0~255)"
    //% subcategory=Sensor     
    export function qdeeiot_raindrop(): number {
        if (rainDropPort == INVALID_PORT)
            return 0;
        let value: number = 0;
        if (rainDropPort == LightPort.port1) {
            value = pins.analogReadPin(AnalogPin.P1);
            value = mapRGB(value, 0, 1023, 0, 255);
        }
        else if (rainDropPort == LightPort.port6) {
            value = PA6_ad;
        }
        else if (rainDropPort == LightPort.port8) {
            value = PB0_ad;
        }
        return Math.round(value);
    }

/**
* Get the obstacle avoidance sensor status,1 detect obstacle,0 no detect obstacle
*/   
   //% weight=64 blockId=qdee_avoidSensor block="Obstacle avoidance sensor detect obstacle ?"
   //% subcategory=Sensor    
    export function qdee_avoidSensor(): number {
        if (avoidPort == INVALID_PORT)
            return 0;
        let status = 0;
        let flag: number = 0;
        switch (avoidPort)
        {
            case avoidSensorPort.port1:
                pins.setPull(DigitalPin.P1, PinPullMode.PullUp);
                status = pins.digitalReadPin(DigitalPin.P1); break;
            case avoidSensorPort.port2:
                pins.setPull(DigitalPin.P13, PinPullMode.PullUp);
                status = pins.digitalReadPin(DigitalPin.P13);
                break;
            case avoidSensorPort.port3:
                pins.setPull(DigitalPin.P16, PinPullMode.PullUp);
                status = pins.digitalReadPin(DigitalPin.P16);
                break;
            case avoidSensorPort.port6:status = PA6;break;
            case avoidSensorPort.port8:status = PB0;break;
        }   
        if (status == 1)
            flag = 0;
        else
            flag = 1;
        return flag;
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
    //% weight=60 blockId="qdeeiot_gettemperature" block="Qdee get %select"
    //% subcategory=Sensor     
    export function qdeeiot_gettemperature(select: Temp_humi): number {
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
           case Qdee_IOTCmdType.LED_COLOR:cmdStr = "A";break;
           case Qdee_IOTCmdType.BUZZER:cmdStr = "B";break;
           case Qdee_IOTCmdType.SHOW:cmdStr = "C";break;
           case Qdee_IOTCmdType.SHAKE:cmdStr = "D";break;  
           case Qdee_IOTCmdType.IR_REMOTE:cmdStr = "E";break;  
           case Qdee_IOTCmdType.SOUND:cmdStr = "F";break;
           case Qdee_IOTCmdType.LIGHT:cmdStr = "G";break;
           case Qdee_IOTCmdType.TEMP:cmdStr = "H";break;
           case Qdee_IOTCmdType.HUMI:cmdStr = "I";break;
           case Qdee_IOTCmdType.SOIL_HUMI:cmdStr = "J";break;
           case Qdee_IOTCmdType.ULTRASONIC:cmdStr = "K";break;
           case Qdee_IOTCmdType.WATERPUMP_ON:
           case Qdee_IOTCmdType.WATERPUMP_OFF:
               cmdStr = "L"; break;
           case Qdee_IOTCmdType.SERVO:cmdStr = "M";break;   
           case Qdee_IOTCmdType.RAINDROP:cmdStr = "N";break;    
           case Qdee_IOTCmdType.INFRARED:cmdStr = "O";break;      
           case Qdee_IOTCmdType.BUSSERVO:cmdStr = "P";break;   
           case Qdee_IOTCmdType.MOTOR:cmdStr = "Q";break; 
           case Qdee_IOTCmdType.SENSOR: cmdStr = "R"; break;    
           case Qdee_IOTCmdType.FAN: cmdStr = "T"; break;
           case Qdee_IOTCmdType.DIGITAL_TUBE: cmdStr = "U"; break;
           case Qdee_IOTCmdType.LIGHT_BELT: cmdStr = "V"; break;
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

    /**
    * Send sensor data 
    * 
    */
   //% weight=55 blockId="qdee_sendSelectSensorData" block="Send sensor data"
  //% subcategory=Data
    export function qdee_sendSelectSensorData() {
        if (sensorList.length > 0)
        {
            let cmdStr: string = "R";
            for (let i = 0; i < sensorList.length; i++)
            {
                cmdStr += "|";
                switch (sensorList[i])
                {
                    case 1: cmdStr += ("A" + volume.toString()); break;
                    case 2: cmdStr += ("B" + (ultraPort != INVALID_PORT ? qdeeiot_ultrasonic().toString() : 'NO')); break;
                    case 3: cmdStr += ("C" + (lightPort != INVALID_PORT ? qdeeiot_getLightLevel().toString() : 'NO')); break;
                    case 4: cmdStr += ("D" + (soilHumiPort != INVALID_PORT ? qdeeiot_getsoilhumi().toString() : 'NO')); break;
                    case 5: cmdStr += ("E" + (rainDropPort != INVALID_PORT ? qdeeiot_raindrop().toString() : 'NO')); break;
                    case 6: cmdStr += ("F" + (avoidPort != INVALID_PORT ? qdee_avoidSensor().toString() : 'NO')); break;
                    case 7: cmdStr += ("G" + currentVoltage.toString()); break;
                }
            }
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

    /**
     * Set the color of the colored lights, after finished the setting please perform  the display of colored lights.
     */
    //% weight=44 blockId=qdee_belt_setPixelRGB block="Set light belt|%lightoffset|color to %rgb"
    //% subcategory=Coloured_lights    
    export function qdee_belt_setPixelRGB(lightoffset: QdeeLightsBelt, rgb: QdeeRGBColors) {
        lhRGBLightBelt.setBeltPixelColor(lightoffset, rgb);
    }
     
    function qdee_belt_setPixelRGBSerial(lightoffset: QdeeLightsBelt, r: number, g: number, b: number) {
        lhRGBLightBelt.setPixelColorRGB(lightoffset, r, g, b);
    }
    /**
     * Set the color of the colored lights, after finished the setting please perform  the display of colored lights.
     */
    //% weight=42 blockId=qdee_belt_setPixelRGBIndex block="Set light belt|%lightoffset|color to %rgb(1~9)"
    //% subcategory=Coloured_lights    
    export function qdee_belt_setPixelRGBIndex(lightoffset: QdeeLightsBelt, rgb: number) {
        lhRGBLightBelt.setBeltPixelColor(lightoffset, rgb);
    }
    
    /**
     * Set the color of the colored lights, after finished the setting please perform  the display of colored lights.
     */
    //% weight=40 blockId=qdee_belt_setPixelRGBSingle block="Set light belt index(0~14)|%lightoffset|color to %rgb"
    //% lightoffset.min=0 lightoffset.max=14 
    //% subcategory=Coloured_lights    
    export function qdee_belt_setPixelRGBSingle(lightoffset: number, rgb: QdeeRGBColors) {
        lhRGBLightBelt.singleSetBeltPixelColor(lightoffset, rgb);
    }
     
    /**
     * Set the color of the colored lights, after finished the setting please perform  the display of colored lights.
     */
    //% weight=38 blockId=qdee_belt_setPixelRGBSingleRGBIndex block="Set light belt index(0~14)|%lightoffset|color to %rgb(1~9)"
    //% lightoffset.min=0  lightoffset.max=14 
    //% subcategory=Coloured_lights    
    export function qdee_belt_setPixelRGBSingleRGBIndex(lightoffset: number, rgb: number) {
        lhRGBLightBelt.singleSetBeltPixelColor(lightoffset, rgb);
    }
    
    /**
     * Display the colored lights, and set the color of the colored lights to match the use. After setting the color of the colored lights, the color of the lights must be displayed.
     */
    //% weight=36 blockId=qdee_belt_showLight block="Show light belt"
    //% subcategory=Coloured_lights    
    export function qdee_belt_showLight() {
        lhRGBLightBelt.show();
    }

    /**
     * Clear the color of the colored lights and turn off the lights.
     */
    //% weight=34 blockGap=50 blockId=qdee_belt_clearLight block="Clear light belt"
    //% subcategory=Coloured_lights    
    export function qdee_belt_clearLight() {
        lhRGBLightBelt.clear();
    }
}
