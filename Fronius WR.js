// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: yellow; icon-glyph: magic;
//
// This script was inspired by the famous telekom api script
// and just adjusted to pare the json output from a fronius inverter
//

const apiUrl = "http://xxx.xxx.xxx.xxx/solar_api/v1/GetPowerFlowRealtimeData.fcgi"

let widget = await createWidget()
widget.backgroundColor = new Color("#1DCDCD")
if (!config.runsInWidget) {
  await widget.presentSmall()
}

Script.setWidget(widget)
Script.complete()

async function createWidget(items) {
  let fm = FileManager.local()
  let dir = fm.documentsDirectory()
  let path = fm.joinPath(dir, "scriptable-fronius.json")

  const list = new ListWidget()
  list.addSpacer(16)

  try {
    let r = new Request(apiUrl)
    // setting the mobile header
    r.headers = {
      "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.1 Mobile/15E148 Safari/604.1"
    }
    
    let data, fresh = 0
    try {
      // Fetch data from inverter 
      data = await r.loadJSON()
      // Write JSON to iCloud file
      fm.writeString(path, JSON.stringify(data, null, 2))
      fresh = 1
    } catch (err) {
      // Read data from iCloud file
      data = JSON.parse(fm.readString(path), null)
      if (!data || !data.Body.Data.Site.E_Day) {
        const errorList = new ListWidget()
        errorList.addText("Check connection, normally the inverter is just reachable in your local lan/wlan")
        return errorList
      }
    }
    
    const line1 = list.addText("Fronius Data")
    line1.font = Font.mediumSystemFont(12)
    
    const line2 = list.addText(data.Body.Data.Site.E_Day + " total")
    line2.font = Font.boldSystemFont(18)
    line2.textColor = Color.black()
    
    const line3 = list.addText(data.Body.Data.Site.P_PV + " current")
    line3.font = Font.mediumSystemFont(20)
    
   // list.addSpacer(16)
        
    if (fresh == 0) {
      line1.textColor = Color.darkGray()
      line2.textColor = Color.darkGray()
      line3.textColor = Color.darkGray()
      if (data.remainingTimeStr) {
        line4.textColor = Color.darkGray()
        line5.textColor = Color.darkGray()
      }
    }
    
  } catch(err) {
    list.addText("Error fetching JSON from your inverter!!!")
  }

  // Add time of last widget refresh:
  list.addSpacer(4)
  const now = new Date();
  const timeLabel = list.addDate(now)
  timeLabel.font = Font.mediumSystemFont(10)
  timeLabel.centerAlignText()
  timeLabel.applyTimeStyle()
  timeLabel.textColor = Color.darkGray()
  
  return list
}