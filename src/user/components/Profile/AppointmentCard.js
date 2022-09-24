import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apis from "../../../apis";

export default function AppointmentCard({
  uName,
  _id,
  use_id,
  doctor_id,
  date,
  session,
  time,
  status,
  onClicked
}) {

    const navigate = useNavigate();

    let [doctorData, setDoctorData] = useState({});

    const getDoctorDetails = async () => {
      let results;
      await apis.get(`doctor/${doctor_id}`).then((data) => {
        results = data.data;
      });

      if (results !== null) {
        setDoctorData(results);
      }
    };


     const cancelAppointment = async () => {
       await apis
         .delete(`appointment/${_id}`)
         .then((res) => {
          onClicked(_id);
          console.log(res)})
         .catch((e) => console.log(e));
     };

    useEffect(() => {
      getDoctorDetails();
    }, []);

  return (
    <div className="container shadow-sm profile-tabbar-content-all-tab-appointment-card">
      <div className="profile-tabbar-content-all-tab-appointment-card-sect-1">
        <h6>{doctorData.hospital}</h6>
        <p>{doctorData.hospital_address}</p>
      </div>

      <div className="profile-tabbar-content-all-tab-appointment-card-sect-2">
        <img src={doctorData.img} alt="" className="profile-tabbar-content-all-tab-appointment-card-sect-2-pic"></img>
        <div className="profile-tabbar-content-all-tab-appointment-card-sect-2-data">
          <h6>{doctorData.name}</h6>
          <p>{doctorData.department}</p>
        </div>
      </div>
      <div className="profile-tabbar-content-all-tab-appointment-card-sect-3">
        <div>
          <p>Appointment Date</p>
          <p>Session</p>
          <p>Time</p>
          <p>Booking for</p>
          <p>Status</p>
        </div>
        <div>
          <p>:</p>
          <p>:</p>
          <p>:</p>
          <p>:</p>
          <p>:</p>
        </div>
        <div className="profile-tabbar-content-all-tab-appointment-card-sect-3-right">
          <p>{date}</p>
          <p>{session}</p>
          <p>{time}</p>
          <p>{uName}</p>
          <p>{status}</p>
        </div>
      </div>
      <div className="profile-tabbar-content-all-tab-appointment-card-sect-4">
        <div className="profile-tabbar-content-all-tab-appointment-card-sect-4-left">
          {status === "Active"?<p>Confirmed</p>:null}
        </div>
        <div className="profile-tabbar-content-all-tab-appointment-card-sect-4-right">
          {status === "Active"?<button className="btn appointment-cancel-button" onClick={cancelAppointment}>CANCEL</button>:
            <p>Consulted</p>
          }
        </div>
      </div>
    </div>
  );
}
