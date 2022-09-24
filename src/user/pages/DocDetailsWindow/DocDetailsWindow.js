import React, { useState, useEffect } from "react";
import { Stepper, Step, StepLabel } from "@mui/material";
import apis from "../../../apis";
import CardContent from "@mui/material/CardContent";
import { Card, Typography, Chip } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import "./DocDetailsWindow.scss";
import bcrypt from "bcryptjs";
import image from "../../../assets/booked.png";
import docImage from "../../../assets/cv.png";

export default function DocDetailsWindow() {
  // Doctor data fetch start

  const [selectedDate, setSelectedDate] = useState(
    JSON.stringify(new Date()).split("T")[0].slice(1)
  );
  let [email, setemail] = useState("");
  let [password, setpassword] = useState("");
  const navigate = useNavigate();
  const location = useLocation().state;
  const doctorId = location.doctor_id;
  const userId = localStorage.getItem("_id");
  const [timeShow, setTimeshow] = useState([]);
  const [displayTime, setDisplayTime] = useState(false);
  let i = 0;
  const [step, setStep] = useState(i);

  let timeSlot;

  let [doctorData, setDoctorData] = useState({});

  useEffect(() => {
    getDoctorDetails();
    getSlotDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getDoctorDetails = async () => {
    let results;
    await apis.get(`doctor/${doctorId}`).then((data) => {
      results = data.data;
    });

    if (results !== null) {
      setDoctorData(results);
    }
  };

  const getSlotDetails = async () => {
    let results1;
    await apis.get("slot").then((data) => {
      results1 = data.data;
    });

    setTimeshow(results1);
  };

  // Doctor data fetch end

  // const [tasks, setTasks] = useState(doctorData);
  const [activeStep, setActiveStep] = useState(1);
  let updateStep = (i) => {
    setActiveStep(i);
  };

  //Update appointment start

  let updateDoctorSlots = async (slotTime) => {
    const new_slots = [];
    console.log(slotTime);
    timeSlot.slots.forEach((slot) => {
      if (slot !== slotTime) {
        new_slots.push(slot);
      }
    });
    await apis
      .put(`slot/${timeSlot._id}`, {
        slots: new_slots,
      })
      .then((data) => console.log(data))
      .catch((error) => console.log(error));
  };

  let addAppointment = async (time1) => {
    let appointment_id;
    let session1 = "Morning";
    if (time1.includes("PM")) {
      session1 = "Afternoon";
    }

    await apis
      .post("appointment", {
        user_id: userId,
        doctor_id: doctorId,
        date: selectedDate,
        session: session1,
        time: time1,
        status: "Active",
        mail_id: localStorage.getItem("_mail"),
        doctor_name: doctorData.name,
      })
      .then((data) => {
        console.log("Appointment posted.");
        appointment_id = data.data;
      })
      .catch((error) => console.log(error));

    updateStep(4);
  };

  let loggedIn;

  //Update appointment end

  let timeComponent = () => {
    let isEmpty = true;
    let times;

    if (timeShow.length !== 0) {
      isEmpty = false;
      times = timeShow.filter((it) => {
        return it.date === selectedDate && it.doctor_id === doctorId;
      })[0];

      console.log(times);
      timeSlot = times;
    }

    if(times === undefined){
      isEmpty = true;
    }

    let submit = async () => {
      console.log(email, password);
      let results;
      let match = false;
      await apis
        .get("user")
        .then((data) => {
          results = data.data;
        })
        .catch((error) => {
          console.log(error);
        });

      results.map((data) => {
        bcrypt.compare(password, data.password, (err, res) => {
          console.log(res);
          if (res === true && email === data.email) {
            match = true;
            localStorage.setItem("_id", data._id);
            localStorage.setItem("user_name", data.name);
            localStorage.setItem("_mail", data.email);
            console.log("loggedIn");
            loggedIn = true;
            navigate("/doctor-window", {state:{doctor_id: doctorId}});
            console.log(loggedIn);
          }
        });
      });
    };

    if (isEmpty === false) {
      return (
        <div className="mt-2 mb-7">
          <div className="chip-div" direction="row" spacing={1}>
            {times.slots.map((item3) => {
              return (
                <Chip
                  style={{
                    color: "white",
                    backgroundColor: "cadetblue",
                    width: "80px",
                    margin: "15px",
                    marginLeft: "0",
                    marginTop: "30px",
                  }}
                  data-bs-toggle="modal"
                  data-bs-target={
                    localStorage.getItem("_id") != null
                      ? "#exampleModalCenter"
                      : "#exampleModal"
                  }
                  onClick={() => {
                    console.log("clicked");
                    if (localStorage.getItem("_id") !== null) {
                      addAppointment(item3);
                      updateDoctorSlots(item3);
                      updateStep(3);
                    } else {
                      console.log("not logged in");
                    }
                  }}
                  label={item3}
                />
              );
            })}
          </div>

          <div
            class="modal fade"
            id="exampleModalCenter"
            tabindex="-1"
            role="dialog"
            aria-labelledby="exampleModalCenterTitle"
            aria-hidden="true"
          >
            <div class="modal-dialog modal-dialog-centered" role="document">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title" id="exampleModalLongTitle">
                    Booking Status
                  </h5>
                  <button
                    type="button"
                    class="close"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                    onClick={()=>navigate("/")}
                  >
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div>
                <div class="modal-body">
                  <div>
                    <div className="modalContents">
                      {" "}
                      <img src={image} alt="here" height={100} width={100} />
                    </div>
                    <div className="modalContents">
                      {" "}
                      <h1>AWESOME..!</h1>
                    </div>
                  </div>
                  <div className="modalContents">
                    YOUR BOOKING HAS CONFIRMED
                    <br />
                    Check your email for your details
                  </div>
                </div>
                <div class="modal-footer">
                  <button
                    type="button"
                    class="btn btn-secondary"
                    data-bs-dismiss="modal"
                    onClick={()=>navigate("/")}
                  >
                    Back to Home
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div
            class="modal fade"
            id="exampleModal"
            tabindex="-1"
            role="dialog"
            aria-labelledby="exampleModalLabel"
            aria-hidden="true"
          >
            <div class="modal-dialog" role="document">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title" id="exampleModalLabel">
                    Log In
                  </h5>
                  <button
                    type="button"
                    class="close"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                  >
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div>
                <div class="modal-body">
                  <form>
                    <div class="form-group">
                      <label for="recipient-name" class="col-form-label">
                        email
                      </label>
                      <input
                        type="text"
                        class="form-control"
                        id="email"
                        onChange={(e) => {
                          setemail(e.target.value);
                        }}
                      />
                    </div>
                    <div class="form-group">
                      <label for="message-text" class="col-form-label">
                        password
                      </label>
                      <input
                        type="password"
                        class="form-control"
                        id="password"
                        onChange={(e) => {
                          setpassword(e.target.value);
                        }}
                      />
                    </div>
                  </form>
                </div>
                <div class="modal-footer">
                  <button
                    type="button"
                    class="btn btn-secondary"
                    data-bs-dismiss="modal"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    class="btn btn-primary"
                    data-bs-dismiss="modal"
                    onClick={submit}
                  >
                    submit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="Main-Background">
      <div className="Wrapper">
        <div className="Wrapper-in-top">
          <div className="Doctor-details">
            <div className="Doctor-details-left">
              {docImage === null ? (
                <img src={docImage} alt="" className="Doctor-photo" />
              ) : (
                <img className="Doctor-photo" src={doctorData.img} alt="" />
              )}
            </div>
            <div className="Doctor-details-right">
              <div className="Doctor-data-title">
                <h3 className="Doctor-data">Doctor Details</h3>
              </div>
              <div className="Doctor-data-main">
                <div className="Doctor-data-right">
                  <ul className="Docdata">
                    <li className="Docdata-elements">
                      <span className="leftside">Name : </span>
                      {doctorData.name}
                    </li>
                    <li className="Docdata-elements">
                      <span className="leftside">Hospital Name : </span>
                      {doctorData.hospital}
                    </li>
                    <li className="Docdata-elements">
                      <span className="leftside">E-mail : </span>
                      {doctorData.email}
                    </li>
                    <li className="Docdata-elements">
                      <span className="leftside">Hospital Address : </span>
                      {doctorData.hospital_address}
                    </li>
                  </ul>
                </div>
                <div className="Doctor-data-right2">
                  <ul className="Docdata2">
                    <li className="Docdata-elements2">
                      <span className="leftside2">Speciality : </span>{" "}
                      {doctorData.department}
                    </li>
                    <li className="Docdata-elements2">
                      <span className="leftside2">Location : </span>
                      {doctorData.district}
                    </li>
                    <li className="Docdata-elements2">
                      <span className="leftside2">Experience : </span>
                      {doctorData.experience}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className="stepcontact">
            <div className="stepper">
              <div>
                <div className="bookingStatus">
                  <p>BOOKING PROGRESS</p>
                </div>
                <Stepper activeStep={activeStep} orientation="vertical">
                  <Step>
                    <StepLabel> Choose Doctor</StepLabel>
                  </Step>
                  <Step>
                    <StepLabel> Choose Date</StepLabel>
                  </Step>
                  <Step>
                    <StepLabel> Choose Time</StepLabel>
                  </Step>
                  <Step>
                    <StepLabel> Apply for Booking</StepLabel>
                  </Step>
                </Stepper>
              </div>
            </div>
          </div>
        </div>
        <div className="Booking-slots">
          <div className="Booking-slots-left">
            <div className="mt-0 ">
              <div className="input-group date slot-date-grid" id="datepicker">
                <input
                  className="container shadow-sm slot-date"
                  defaultValue={selectedDate}
                  value={selectedDate}
                  onChange={async (e) => {
                    setSelectedDate(e.target.value);
                    await getSlotDetails(e.target.value);
                    setDisplayTime(true);
                    updateStep(2);
                  }}
                  type="date"
                  id="date"
                />
              </div>
              <div>{displayTime ? timeComponent() : null}</div>
            </div>
          </div>
          <div className="Booking-slots-right">
            <div className="mt-5 contactcard">
              <Card
                sx={{ width: 300 }}
                style={{ backgroundColor: "white", borderRadius: "4px" }}
                elevation={1}
              >
                <CardContent>
                  <Typography
                    sx={{ fontSize: 14 }}
                    color="text.secondary"
                    gutterBottom
                  >
                    REQUIRE ASSISTANCE ...?
                  </Typography>
                  <Typography variant="h5" component="div">
                    CONTACT BELOW
                  </Typography>
                  <Typography sx={{ mb: 1.5 }} color="text.secondary">
                    +123456789
                  </Typography>
                  <Typography variant="body2">
                    mail id:{" "}
                    <a href="mailto:jeevanshaji144@gmail.com">
                      samplemail@gmail.com
                    </a>
                  </Typography>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
