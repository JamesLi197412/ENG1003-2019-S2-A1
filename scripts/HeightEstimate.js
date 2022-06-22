let errorOutput = document.getElementById("toast");

//  Setup of sensor data list and the orientation sensor.
let orientDevice = null;
let lastSensorData = [];
const N = 13;

//  Data values used to calculate distance to object and its height.
let currentTilt = 0;
let baseAngle = 0;
let topAngle = 0;
let cameraHeight = 0;
let distanceOfObject = 0;
let heightOfObject = 0;

//  Tries to implement sensor. Try and catch referenced from the
//  sensor test app code in case the sensor malfunctions.
try
{

    orientDevice = new AbsoluteOrientationSensor({frequency: 10});

//  The orientation sensor is given a listerner for errors.
    orientDevice.addEventListener('error', event => {

        if (event.error.name === "NotAllowedError")
        {
            errorOutput.innerHTML = "You are denied from using the sensor.";
        }
        else if(event.error.name === "NotReadableError")
        {
            errorOutput.innerHTML = "There is a problem with the sensor connection.";
        }

    });

// Before the orientation device turns on,
// it is given a listerner for reading the tilt angle.
    orientDevice.addEventListener('reading', () => readSensorAngle(orientDevice));
    orientDevice.start();

} catch(error) {
//  In case of a problem of implementing the sensor
//  the error message is printed to inform the user.
    if (error.name === "SecurityError")
    {
        errorOutput.innerHTML = "Sensor is blocked due to the Feature Policy.";
    }
    else if(error.name === "ReferenceError")
    {
        errorOutput.innerHTML = "Sensor is not supported by the User Agent.";
    }
    else
    {
        errorOutput.innerHTML = "Sensor cannot be used.";
    }

}

// This function is used to read the tilt angle in two decimal places.
// orientDevice: the orientation sensor device to use
function readSensorAngle(orientDevice)
{
    let currentAngle = convertQuarternionToAngle(orientDevice.quaternion);
    currentTilt = smoothAngle(currentAngle);
    document.getElementById("tiltAngle").innerHTML = currentTilt.toFixed(2);
}

//  This function is used to return the angle as a smoothed angle or the most recent read angle.
//  angle: the new angle to add in to the last sensor data recorded
function smoothAngle(angle)
{
//  Adds angle to the sensor list of the most recent measured angles.
//  If the sensor list contains the last N or more values,

    lastSensorData.push(angle);
    if (lastSensorData.length >= N)
    {

      // Removes the earliest measured values to keep length equal to N.
        let k = lastSensorData.length - N;
        lastSensorData.splice(0, k);


        let totalAngle = 0;
        for (let i = 0; i < lastSensorData.length; i++)
        {
            totalAngle += lastSensorData[i];
        }

        //  Return average angle
        let averageAngle =  totalAngle / lastSensorData.length;
        lastSensorData = [];
        return averageAngle;

    }

    return angle;
}

//  This function is used to convert quarternion to return angle in degrees about the x-axis
//  OrientQuarternion: the quaternion coordinates to use for conversion
function convertQuarternionToAngle(orientQuarternion)
{
    let x = orientQuarternion[0];
    let y = orientQuarternion[1];
    let z = orientQuarternion[2];
    let w = orientQuarternion[3];


    return Math.atan2(2*(w*x + y*z), (1 - 2*(Math.pow(x,2) + Math.pow(y,2)))) * 180/Math.PI;
}

// Returns the input of the camera height.
function inputCamHeight()
{
  let input = prompt("Enter the camera height in metres: ");

  // Validates the input t0 check if it is non-negative number
  while (isNaN(input) || input < 0)
  {
      input = Number(prompt("Please enter the valid and reasonable camera height in metres: "));
  }

  //  If input is blank text or nothing,set it as default
  //  Otherwise transfer the value from string to Number
  if (input == null || input.trim() == "")
  {
    input = 1.8;    // By default value
  }
  else
  {
    input = Number(input);
  }

  cameraHeight = input;

  return cameraHeight.toFixed(2); // For 2 decmial

}

//  This function is used to record & display the base angle or top angle
//  isTopAngle--true to record and display the top angle,
//  false: to record and display the base angle.
function recordTiltAngle(isTopAngle)
{
  if (isTopAngle)
  {
    // It is required that the base angle < current tilt angle < 180 degrees. Base angle should also be displayed.
    if (currentTilt > baseAngle && currentTilt < 180 && document.getElementById("baseAngle").innerHTML != "")
    {
      topAngle = currentTilt - baseAngle;
      document.getElementById("topAngle").innerHTML = topAngle.toFixed(2);
      alert("Top angle is recorded and shwon below");
    }
  }
  else
  {
    // It is required that the current tilt angle is acute (0 < current tilt angle < 90 degrees)
    if (currentTilt > 0 && currentTilt < 90)
    {
      baseAngle = currentTilt;
      document.getElementById("baseAngle").innerHTML = baseAngle.toFixed(2);
      alert("Bottom angle is recorded and shown below");
    }
  }
}

//  Performs the calculation on the distance to the object
//  and its height when calculate button is pressed
function performCalculation(){
  let baseAngleText = document.getElementById("baseAngle").innerHTML;
  let camHeightText = document.getElementById("camHeightDisplay").innerHTML;
  let topAngleText = document.getElementById("topAngle").innerHTML;

  // Check if the base angle and camera height are updated. i.e Not displayed blank, ""
  if (baseAngleText != "" && camHeightText != "")
  {
    calculateDistance();
  }

  // Check if the base and top angles, camera height and distance are updated. i.e Not displayed blank, ""
  let distanceText = document.getElementById("distanceOfObject").innerHTML;
  if (topAngleText != "" && distanceText != "" && baseAngleText != "" && camHeightText != "")
  {
    calculateHeight();
  }
}

// This function is used to calculates the distance to the object
//  and displays it in two decimal places(nicer representation)
function calculateDistance()
{
	 let radianBeta = baseAngle * Math.PI/180;
	 distanceOfObject = input * Math.tan(radianBeta);
   document.getElementById("distanceOfObject").innerHTML = distanceOfObject.toFixed(2);
}

//  This function is used to calculate the Height of the object
//  and Display it in two decimal places
function calculateHeight()
{
   let finalAngleDegree = 180 - baseAngle - topAngle;
   let finalAngleRadian = finalAngleDegree * Math.PI/180;
   let topAngleRadian = topAngle * Math.PI/180;

   // Calculates the height using the sine rule.
   let heightPart = Math.sqrt(Math.pow(cameraHeight, 2) + Math.pow(distanceOfObject, 2)) * Math.sin(topAngleRadian);
   heightOfObject = heightPart / Math.sin(finalAngleRadian);
   document.getElementById("heightOfObject").innerHTML = heightOfObject.toFixed(2);
}
