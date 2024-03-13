var cron = require('node-cron');
const MinistryPlatformAPI = require('ministry-platform-api-wrapper');
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

const getPrayerSchedules = async () => await MinistryPlatformAPI.request('get', '/tables/Prayer_Schedules', {"$filter":"Start_Date > GETDATE() AND Start_Date < GETDATE()+7 AND ([5min_Reminder]=1 OR [1hr_Reminder]=1 OR [24hr_Reminder]=1 OR [3d_Reminder]=1 OR [7d_Reminder]=1)","$orderby":"Start_Date"}, {});

const sendText = (phone, message) => client.messages
  .create({
    body: message,
    to: phone,
    messagingServiceSid: process.env.TWILIO_SERVICE_SID
  })
  .then(message => message)
  .catch(error => console.error(error))
// const sendText = (phone, message) => console.log(`texting ${phone}: ${message}`)

const handleNotifications = (prayerSchedules) => {
  const schedulesToUpdate = [];
  // get any where startdate is within 1hr
  const fiveMinsToMs = 1000 * 60 * 5;
  const hourToMs = 1000 * 60 * 60;
  const dayToMs = 1000 * 60 * 60 * 24;
  const threeDaysToMs = 1000 * 60 * 60 * 24 * 3;
  const sevenDaysToMs = 1000 * 60 * 60 * 24 * 7;
  const prayerSchedulesWithin5Mins = prayerSchedules.filter(schedule => schedule['5min_Reminder'] === true && new Date(schedule.Start_Date) - new Date() <= fiveMinsToMs);
  const prayerSchedulesWithin1Hr = prayerSchedules.filter(schedule => schedule['1hr_Reminder'] === true && new Date(schedule.Start_Date) - new Date() <= hourToMs);
  // const prayerSchedulesWithin1D = prayerSchedules.filter(schedule => schedule['1d_Reminder'] === true && new Date(schedule.Start_Date) - new Date() <= dayToMs);
  // const prayerSchedulesWithin3D = prayerSchedules.filter(schedule => schedule['3d_Reminder'] === true && new Date(schedule.Start_Date) - new Date() <= threeDaysToMs);
  // const prayerSchedulesWithin7D = prayerSchedules.filter(schedule => schedule['7d_Reminder'] === true && new Date(schedule.Start_Date) - new Date() <= sevenDaysToMs);

  // loop through 5min and 1hr and send texts
  prayerSchedulesWithin5Mins.forEach(schedule => {
    sendText(process.env.TEST_PHONE, `Thank you ${schedule.First_Name} for praying at ${new Date(schedule.Start_Date).toLocaleTimeString()}. It is now your time to pray!`);
    schedule['5min_Reminder'] = false;
    schedulesToUpdate.push(schedule);
  });
  prayerSchedulesWithin1Hr.forEach(schedule => {
    sendText(process.env.TEST_PHONE, `Thank you ${schedule.First_Name} for praying at ${new Date(schedule.Start_Date).toLocaleTimeString()}. Your time to pray is in 1 hour!`);
    schedule['1hr_Reminder'] = false;
    schedulesToUpdate.push(schedule);
  });

  // in MP, turn off any notifications that were sent so they don't get sent again
  MinistryPlatformAPI.request('put', '/tables/Prayer_Schedules', {}, schedulesToUpdate);

  // console.log('Schedules within 5mins: ',prayerSchedulesWithin5Mins.length);
  // console.log('Schedules within 1hr: ',prayerSchedulesWithin1Hr.length);
  // console.log('Schedules within 1d: ',prayerSchedulesWithin1D.length);
  // console.log('Schedules within 3d: ',prayerSchedulesWithin3D.length);
  // console.log('Schedules within 7d: ',prayerSchedulesWithin7D.length);
  // console.log('---------------------------------------------')
}

const scheduler = () => getPrayerSchedules()
  .then(prayerSchedules => handleNotifications(prayerSchedules))
  .catch(error => console.error(error));

const runScheduler = () => {
  console.log('Initiating notification scheduler');
  // scheduler();
  return cron.schedule('*/5 * * * *', scheduler);
};

module.exports = runScheduler;