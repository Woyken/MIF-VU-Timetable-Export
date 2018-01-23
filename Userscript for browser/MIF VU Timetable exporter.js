// ==UserScript==
// @name     MIF VU Timetable exporter
// @version  1
// @grant    none
// @include  https://mif.vu.lt/timetable/mif/groups/*
// // @require  https://apis.google.com/js/api.js
// @grant    unsafeWindow
// ==/UserScript==

/* 
* as of time of writing this: 2017-01,
* Timetable system is populated by javascript in which there's generated json 
* where all lecture's info is provided. 
* Will be parsing that.
* Ex:
* {
*     
*         "title": " \
*         <a data-toggle='popover' \
*            data-template='<div class=\"popover\" role=\"tooltip\"><div class=\"arrow\"></div><div class=\"popover-title\"></div><div class=\"popover-content\"></div></div>' \
*            data-subject='<a href=\"/timetable/mif/subjects/programu-sistemu-kurimas/\">Software Development</a>' \
*            data-subjecttype='Compulsory' \
*            data-eventtype='<a href=\"/timetable/mif/subjects/programu-sistemu-kurimas/\">EXERCISES</a> ' \
*            data-groups='' \
*            data-academics='<a href=\"/timetable/mif/employees/justinas-marcinka/\">Justinas Marcinka, Lab. Asst.</a>' \
*            data-rooms='<a href=\"/timetable/mif/rooms/323-mif-i/\">323 (MIF-Didl.)</a>' \
*            data-assessment='' \
*            data-comments='' \
*            data-academiccomments='' \
*            data-subgroups=' Subgroups: 1' \
*            tabindex='0'> \
*             Software Development \
*         </a> Subgroups: 1<br>323 (MIF-Didl.)",
*     
*     "start": "2018-02-05T14:00:00",
*     "end": "2018-02-05T16:00:00",
*     "className": "e13774"
*     
* }
*/


window.addEventListener("load", () => {main();})

function main() {
  console.log("fetching all lectures list...");
  var lectureArray = [];
	var allScripts = document.body.getElementsByTagName("script");
  for (var i = 0; i < allScripts.length; i++) {
    var curScriptSearch = allScripts[i].innerHTML;
    curScriptSearch = curScriptSearch.replace(/\\\n/g, '\n');
    var jsonStart = 0;
    while(-1 != jsonStart) {
      jsonStart = curScriptSearch.search('{([ ]*\r?\n)*.*"title"');
      if(-1 === jsonStart)
        break;
      curScriptSearch = curScriptSearch.substr(jsonStart);
      var jsonEnd = curScriptSearch.search('\n[ ]*}');
      var lectureJson = curScriptSearch.substr(0, jsonEnd).replace(/\n/g, '') + '}';
      var lectureObj = {};
      try {
        lectureObj = JSON.parse(lectureJson);
      }
      catch(e) {
        console.log("can't deal with this: " + lectureJson);
        //return;
      }
      try {
      	lectureObj = ParseLectureXmlPartsToJson(lectureObj);
      	lectureArray.push(lectureObj);
      }
      catch(e) {
        //console.log("can't parse this:");
        //console.log(lectureObj);
      }
      //console.log("adding lecture");
      curScriptSearch = curScriptSearch.substr(jsonEnd);
    }
	}
  console.log("found lectures: " + lectureArray.length);
  console.log("to get output you will need to send this as JSON obj to some storage");
}

function ParseLectureXmlPartsToJson(lecture) {
  var newLectureObj = {};
  var fullTitleEl = ConvertToHtmlElementFromString(lecture.title);
  // "<head></head><body><a data-toggle=\"popover\" data-template=\"<div class=&quot;popover&quot; role=&quot;tooltip&quot;><div class=&quot;arrow&quot;></div><div class=&quot;popover-title&quot;></div><div class=&quot;popover-content&quot;></div></div>\" data-subject=\"<a href=&quot;/timetable/mif/subjects/operacines-sistemos-2/&quot;>Operating Systems</a>\" data-subjecttype=\"Optional\" data-eventtype=\"<a href=&quot;/timetable/mif/subjects/operacines-sistemos-2/&quot;>LECTURE</a> \" data-groups=\"\" data-academics=\"<a href=&quot;/timetable/mif/employees/antanas-mitasiunas/&quot;>Antanas Mitašiūnas, Assoc. Prof., Dr.</a>\" data-rooms=\"<a href=&quot;/timetable/mif/rooms/102-mif-i/&quot;>102 (MIF-Didl.)</a>\" data-assessment=\"\" data-comments=\"\" data-academiccomments=\"\" data-subgroups=\"\" tabindex=\"0\">             Operating Systems         </a><br>Optional<br>102 (MIF-Didl.)</body>"
  var titleLinkEls = fullTitleEl.getElementsByTagName("a");
  if(titleLinkEls.length > 1 || titleLinkEls.length < 1) {
    throw "lecture structure has definitelly changed. not sure how to parse..";
  }
  var fullTagAEl = titleLinkEls[0];
  // "<a data-toggle=\"popover\" data-template=\"<div class=&quot;popover&quot; role=&quot;tooltip&quot;><div class=&quot;arrow&quot;></div><div class=&quot;popover-title&quot;></div><div class=&quot;popover-content&quot;></div></div>\" data-subject=\"<a href=&quot;/timetable/mif/subjects/operacines-sistemos-2/&quot;>Operating Systems</a>\" data-subjecttype=\"Optional\" data-eventtype=\"<a href=&quot;/timetable/mif/subjects/operacines-sistemos-2/&quot;>LECTURE</a> \" data-groups=\"\" data-academics=\"<a href=&quot;/timetable/mif/employees/antanas-mitasiunas/&quot;>Antanas Mitašiūnas, Assoc. Prof., Dr.</a>\" data-rooms=\"<a href=&quot;/timetable/mif/rooms/102-mif-i/&quot;>102 (MIF-Didl.)</a>\" data-assessment=\"\" data-comments=\"\" data-academiccomments=\"\" data-subgroups=\"\" tabindex=\"0\">             Operating Systems         </a>"
  
  //Note: fullTagAEl.innerHTML should also result in same subjectName
  
  var subjectEl = ConvertToHtmlElementFromString(fullTagAEl.getAttribute("data-subject"));
  // "<a href=\"/timetable/mif/subjects/operacines-sistemos-2/\">Operating Systems</a>"
  var subjectStr = subjectEl.getElementsByTagName("a")[0].innerHTML;
  newLectureObj.subjectName = subjectStr;
  
  var subjectTypeStr = fullTagAEl.getAttribute("data-subjecttype");
  // "Optional"
  newLectureObj.subjectType = subjectTypeStr;
  
  var eventTypeEl = ConvertToHtmlElementFromString(fullTagAEl.getAttribute("data-eventtype"));
  // "<a href=\"/timetable/mif/subjects/operacines-sistemos-2/\">LECTURE</a> "
  var eventTypeStr = eventTypeEl.getElementsByTagName("a")[0].innerHTML;
  newLectureObj.eventType = eventTypeStr;
  
  var lecturerEl = ConvertToHtmlElementFromString(fullTagAEl.getAttribute("data-academics"));
  // "<a href=\"/timetable/mif/employees/antanas-mitasiunas/\">Antanas Mitašiūnas, Assoc. Prof., Dr.</a>"
  var lecturerStr = lecturerEl.getElementsByTagName("a")[0].innerHTML;
  newLectureObj.lecturer = lecturerStr;
  
  var roomsEls = ConvertToHtmlElementFromString(fullTagAEl.getAttribute("data-rooms"));
  // "<a href=\"/timetable/mif/rooms/103-mif-i/\">103 (MIF-Didl.)</a><br><a href=\"/timetable/mif/rooms/101-mif-i/\">101 (MIF-Didl.)</a><br><a href=\"/timetable/mif/rooms/102-mif-i/\">102 (MIF-Didl.)</a>"
  roomsEls = roomsEls.getElementsByTagName("a");
  var roomsStrArray = [];
  for(let i = 0; i < roomsEls.length; i++) {
    roomsStrArray.push(roomsEls[i].innerHTML);
  }
  var roomsStr = roomsStrArray.join(", ");
  newLectureObj.rooms = roomsStr;
  
  var subgroupsStr = fullTagAEl.getAttribute("data-subgroups");
  // " Subgroups: 2"
  newLectureObj.subgroups = subgroupsStr;
  
  newLectureObj.start = lecture.start;
  newLectureObj.end = lecture.end;
  newLectureObj.className = lecture.className;
  newLectureObj.color = lecture.color;
  return newLectureObj;
}

function ConvertToHtmlElementFromString(str) {
	var el = document.createElement( 'html' );
  el.innerHTML = str;
  return el;
}
