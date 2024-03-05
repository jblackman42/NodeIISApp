const express = require('express');
const router = express.Router();

const MinistryPlatformAPI = require('ministry-platform-api-wrapper');

// router.get('/getSchedules', async (req, res) => {
//   await MinistryPlatformAPI.request('get', '/tables/Prayer_Schedules', {"$select":"Prayer_Schedule_ID, Prayer_Schedules.[Start_Date], Prayer_Schedules.[End_Date], Prayer_Schedules.[WPAD_Community_ID], WPAD_Community_ID_Table.[Community_Name]","$filter":`Prayer_Schedules.[Start_Date] BETWEEN '${startDate}' AND '${endDate}' AND Cancelled=0`,"$orderby":"Start_Date"}, {})
// })

router.get('/mySchedules/:guid', async (req, res) => {
  try {
    const { guid } = req.params;
    const data = await MinistryPlatformAPI.request('get', '/tables/Prayer_Schedules', {"$select":"Prayer_Schedules.Start_Date, Prayer_Schedules.First_Name, Prayer_Schedules.Last_Name, Prayer_Schedules.Phone,Prayer_Schedules.Prayer_Schedule_ID, Prayer_Schedules._Prayer_Schedule_GUID","$filter":`WPAD_User_ID_Table.[_User_GUID]='${guid}' AND Prayer_Schedules.Cancelled = 0`}, {});
    res.send(data);
  } catch (error) {
    // console.log(error);
    res.status(500).send("Internal server error");
  }
})

router.delete("/mySchedules", async (req, res) => {
  try {
    const { guid, id } = req.body;
    const data = await MinistryPlatformAPI.request('put', '/tables/Prayer_Schedules', {}, [{"Prayer_Schedule_ID":id,"_Prayer_Schedule_GUID":guid,"Cancelled":"true"}])
    res.send(data);
  } catch (error) {
    res.status(500).send("Internal server error");
  }
})

router.put("/mySchedules/update", async (req, res) => {
  try {
    const { updateData } = req.body;
    const data = await MinistryPlatformAPI.request('put', '/tables/Prayer_Schedules', {}, [updateData])
    res.send(data);
  } catch (error) {
    res.status(500).send("Internal server error");
  }
})

router.get('/championedDays/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = await MinistryPlatformAPI.request(
      'get',
      '/tables/WPAD_Community_Reservations',
      {"$filter":`WPAD_Community_ID=${id} AND Reservation_Date >= GETDATE()`,"$orderby":"Reservation_Date"},
      {}
    );
    res.send(data);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server error");
  }
})

module.exports = router;