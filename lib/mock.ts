import {SchoolSettings,Student} from "./types";

// Helper to format HH:MM dynamically
const formatOffset = (offsetMinutes: number) => {
  const d = new Date(Date.now() + offsetMinutes * 60 * 1000);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

export const school:SchoolSettings={
  name:"The Spirit School",
  address:"Main Campus, Samundri",
  phone:"+92 300 0000000",
  website:"https://school.example.com",
  email:"info@school.example.com",
  welcomeMessage:"السلام علیکم!\nWelcome to The Spirit School\nPlease verify your attendance carefully.",
  themeColor:"#2783DE",
  lectures:[
    {number:1,start:formatOffset(-120),end:formatOffset(-100),meetLink:"https://meet.google.com/demo-one",subject:"English"},
    {number:2,start:formatOffset(-60),end:formatOffset(-40),meetLink:"https://meet.google.com/demo-two",subject:"Math"},
    {number:3,start:formatOffset(-10),end:formatOffset(20),meetLink:"https://meet.google.com/demo-three",subject:"Science"},
    {number:4,start:formatOffset(40),end:formatOffset(60),meetLink:"https://meet.google.com/demo-four",subject:"History"},
    {number:5,start:formatOffset(90),end:formatOffset(110),meetLink:"https://meet.google.com/demo-five",subject:"Computer"},
    {number:6,start:formatOffset(140),end:formatOffset(160),meetLink:"https://meet.google.com/demo-six",subject:"Urdu"},
    {number:7,start:formatOffset(190),end:formatOffset(210),meetLink:"https://meet.google.com/demo-seven",subject:"Islamiat"},
    {number:8,start:formatOffset(240),end:formatOffset(260),meetLink:"https://meet.google.com/demo-eight",subject:"Drawing"}
  ]
};

export const demoStudents:Student[]=[{id:"s1",secretCode:"482917",name:"Ayan Ali",fatherName:"Muhammad Ali",className:"10",section:"A",rollNumber:"10-A-01"}];
