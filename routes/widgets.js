const express = require("express");
const QRCode = require('qrcode');
const router = express.Router();

const MinistryPlatformAPI = require("ministry-platform-api-wrapper");

// Middleware to check for authorized URLs
const checkAuthorizedOrigin = (req, res, next) => {
  const authorizedOrigins = process.env.AUTHORIZED_ORIGINS.split(',');
  const origin = req.headers.origin;

  if (authorizedOrigins.includes(origin)) {
    next(); // Origin is authorized, proceed to the next middleware
  } else {
    res.status(403).send('Access denied. Origin not authorized.'); // Block the request
  }
};

// GENERAL API WRAPPER ROUTE
router.post("/", checkAuthorizedOrigin, async (req, res) => {
  try {
    const { path, query, body } = req.body;
    if (!path) return res.status(400).send("messing method or path");
    const data = await MinistryPlatformAPI.request("get", path, query, body);
    res.send(data);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server error");
  }
})

router.get('/generate-qrcode', checkAuthorizedOrigin, (req, res) => {
  const { url } = req.query;

  // Check if the URL is provided
  if (!url) {
    return res.status(400).send({ error: 'URL is required' });
  }

  // Generate QR code
  QRCode.toDataURL(url, (err, src) => {
    if (err) {
      return res.status(500).send({ error: 'Failed to generate QR code' });
    }

    // Send QR code as an image
    res.type('image/png');
    res.send(Buffer.from(src.split(',')[1], 'base64'));
  });
});

// SERMON SERIES/FINDER WIDGETS
router.get("/series", async (req, res) => {
  try {
    const data = await MinistryPlatformAPI.request(
      "get",
      "/tables/Pocket_Platform_Sermon_Series",
      {
        $select:
          'Sermon_Series_ID, Title, Display_Title, Subtitle, Position, Pocket_Platform_Sermon_Series.Sermon_Series_Type_ID, Sermon_Series_Type_ID_Table.Sermon_Series_Type, Series_UUID, Series_Start_Date, Pocket_Platform_Sermon_Series.Congregation_ID, Congregation_ID_Table.Congregation_Name, dp_fileUniqueId AS "UniqueFileId"',
        $filter: "Status_ID = 3",
        $orderby: "Position DESC",
        $top: "1000",
        $skip: "0",
      },
      {}
    );
    res.send(data);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server error");
  }
});
router.get("/series/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = await MinistryPlatformAPI.request(
      "get",
      `/tables/Pocket_Platform_Sermon_Series/${id}`,
      {
        $select:
          'Sermon_Series_ID, Title, Display_Title, Subtitle, Position, Pocket_Platform_Sermon_Series.Sermon_Series_Type_ID, Sermon_Series_Type_ID_Table.Sermon_Series_Type, Series_UUID, Series_Start_Date, Pocket_Platform_Sermon_Series.Congregation_ID, Congregation_ID_Table.Congregation_Name, dp_fileUniqueId AS "UniqueFileId"',
      },
      {}
    );
    res.send(data[0]);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server error");
  }
});
router.get("/sermon-series/:seriesId", async (req, res) => {
  try {
    const { seriesId } = req.params;
    const data = await MinistryPlatformAPI.request(
      "get",
      "/tables/Pocket_Platform_Sermons",
      {
        $select:
          'Sermon_ID, Series_ID, Pocket_Platform_Sermons.Congregation_ID, Congregation_ID_Table.Congregation_Name, Pocket_Platform_Sermons.Service_Type_ID, Service_Type_ID_Table.Service_Type, Title, Subtitle, Pocket_Platform_Sermons.Description, Sermon_Date, Pocket_Platform_Sermons.Speaker_ID, Speaker_ID_Table.Display_Name, Scripture_Links, Position, Status_ID, Notes_Form_ID, Sermon_UUID, dp_fileUniqueId AS "UniqueFileId"',
        $filter: `Status_ID = 3 AND Series_ID = ${seriesId}`,
        $orderby: "Position DESC",
      },
      {}
    );
    res.send(data);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server error");
  }
});
router.get("/sermon/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = await MinistryPlatformAPI.request(
      "get",
      `/tables/Pocket_Platform_Sermons/${id}`,
      {
        $select:
          'Sermon_ID, Series_ID, Series_ID_Table.[Title] AS "Series_Title", Pocket_Platform_Sermons.Congregation_ID, Congregation_ID_Table.Congregation_Name, Pocket_Platform_Sermons.Service_Type_ID, Service_Type_ID_Table.Service_Type, Pocket_Platform_Sermons.[Title], Pocket_Platform_Sermons.[Subtitle], Pocket_Platform_Sermons.Description, Sermon_Date, Pocket_Platform_Sermons.Speaker_ID, Speaker_ID_Table.Display_Name, Scripture_Links, Pocket_Platform_Sermons.[Position], Pocket_Platform_Sermons.[Status_ID], Notes_Form_ID, Sermon_UUID, dp_fileUniqueId AS "UniqueFileId"',
      },
      {}
    );
    res.send(data[0]);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server error");
  }
});
router.get("/sermon-links/:sermonId", async (req, res) => {
  try {
    const { sermonId } = req.params;
    const data = await MinistryPlatformAPI.request(
      "get",
      "/tables/Pocket_Platform_Sermon_Links",
      {
        $select:
          "Sermon_Link_ID, Sermon_ID, Link_Type_ID_Table.Sermon_Link_Type, Link_Type_ID, Link_URL",
        $filter: `Status_ID = 3 AND Sermon_ID = ${sermonId}`,
      },
      {}
    );
    res.send(data);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server error");
  }
});

// PHC ARTICLES WIDGETS
router.get("/articles", async (req, res) => {
  try {
    const data = await MinistryPlatformAPI.request(
      "get",
      "/tables/PHC_Articles",
      {
        $select:
          "PHC_Article_ID, Views, Title, Publish_Date, PHC_Articles.[PHC_Article_Topic_ID], PHC_Article_Topic_ID_Table.[Topic], PHC_Articles.[PHC_Author_ID], PHC_Author_ID_Table_Contact_ID_Table.[Nickname] + ' ' + PHC_Author_ID_Table_Contact_ID_Table.[Last_Name] AS 'Author_Name', PHC_Author_ID_Table.[Bio] AS 'Author_Bio', PHC_Author_ID_Table.[Facebook_Account] AS 'Author_Facebook_Account', PHC_Author_ID_Table.[Instagram_Account] AS 'Author_Instagram_Account', PHC_Author_ID_Table.[Twitter_Account] AS 'Author_Twitter_Account', PHC_Author_ID_Table_Contact_ID_Table.[Contact_GUID] AS 'Author_Contact_GUID', Body, PHC_Article_GUID",
        $filter: `PHC_Articles.[Enabled] = 1`,
      },
      {}
    );
    res.send(data);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server error");
  }
});

router.get("/articles/:id", async (req, res) => {
  const { id } = req.params;
  if (!id) res.status(400).send("Missing article id");
  try {
    const [data] = await MinistryPlatformAPI.request(
      "get",
      "/tables/PHC_Articles",
      {
        $select:
          "PHC_Article_ID, Views, Title, Publish_Date, PHC_Articles.[PHC_Article_Topic_ID], PHC_Article_Topic_ID_Table.[Topic], PHC_Articles.[PHC_Author_ID], PHC_Author_ID_Table_Contact_ID_Table.[Nickname] + ' ' + PHC_Author_ID_Table_Contact_ID_Table.[Last_Name] AS 'Author_Name', PHC_Author_ID_Table.[Bio] AS 'Author_Bio', PHC_Author_ID_Table.[Facebook_Account] AS 'Author_Facebook_Account', PHC_Author_ID_Table.[Instagram_Account] AS 'Author_Instagram_Account', PHC_Author_ID_Table.[Twitter_Account] AS 'Author_Twitter_Account', PHC_Author_ID_Table_Contact_ID_Table.[Contact_GUID] AS 'Author_Contact_GUID', Body, PHC_Article_GUID",
        $filter: `PHC_Articles.[Enabled] = 1 AND PHC_Article_ID=${id}`,
      },
      {}
    );
    res.send(data);
    await MinistryPlatformAPI.request("put", "/tables/PHC_Articles", {}, [
      { PHC_Article_ID: data.PHC_Article_ID, Views: data.Views + 1 },
    ]);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server error");
  }
});

router.get("/article-graphic/:id", async (req, res) => {
  const { id } = req.params;
  if (!id) res.status(400).send("Missing article id");
  try {
    const [FileData] = await MinistryPlatformAPI.request(
      "get",
      `/files/PHC_Articles/${id}`,
      { $default: "true" },
      {}
    );
    return res.redirect(
      FileData && FileData.UniqueFileId
        ? `https://my.pureheart.org/ministryplatformapi/files/${FileData.UniqueFileId}`
        : "https://www.pureheart.org/wp-content/uploads/2023/03/Welcome-Page-Header-1-scaled.jpg"
    );
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server error");
  }
});

router.get("/author-graphic/:guid", async (req, res) => {
  const { guid } = req.params;
  if (!guid) res.status(400).send("Missing author guid");
  try {
    const [{ Contact_ID }] = await MinistryPlatformAPI.request(
      "get",
      "/tables/Contacts",
      {
        $select: "Contact_ID",
        $filter: `Contact_GUID='${guid}'`,
      },
      {}
    );
    const [FileData] = await MinistryPlatformAPI.request(
      "get",
      `/files/Contacts/${Contact_ID}`,
      { $default: "true" },
      {}
    );
    return res.redirect(
      FileData && FileData.UniqueFileId
        ? `https://my.pureheart.org/ministryplatformapi/files/${FileData.UniqueFileId}`
        : "https://www.pureheart.org/wp-content/uploads/2024/01/default-user.jpg"
    );
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server error");
  }
});

module.exports = router;

// PHC FEATURED EVENTS WIDGETS

router.get('/featured-events', async (req, res) => {
  try {
    const data = await MinistryPlatformAPI.request('get', '/tables/Events', {"$select":'Event_ID,Event_Title,Event_Start_Date,Featured_Event_Custom_URL,dp_fileUniqueId AS "UniqueFileId"',"$filter":"(Event_Start_Date >= GETDATE() AND Event_Start_Date < (GETDATE() + 90)) AND (Featured_On_Calendar=1 OR Force_Featured=1)","$orderby":"Event_Start_Date"}, {});
    res.send(data);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server error");
  }
})