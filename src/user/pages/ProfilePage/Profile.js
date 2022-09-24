import { React, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import apis from "../../../apis";
import AppointmentCard from "../../components/Profile/AppointmentCard";
import DependantCard from "../../components/Profile/DependantCard";
import PrescriptionCard from "../../components/Profile/PrescriptionCard";
import "./Profile.scss";
import img from "../../../assets/profile.jpg";
import * as filestack from "filestack-js";
import Popup from "../../components/Profile/Add_dependant/Add_dependant";

export default function Profile() {
  const location = useLocation();
  const { user_id } = location.state;

  const [buttonPopup, setButtonPopup] = useState(false);

  let [userData, setUserData] = useState({
    name: "John Doe",
    gender: "Male",
    email: "johnDoe",
    dob: "20201-09-23",
    age: 22,
    phoneNumber: "245676543",
    prev_cond:
      "Patient has eczema and asthma\n                 Allergic to dust, red meat, cocoa, meat with exoskeletons\nAllergic reactions often seen as asthma or itchiness in B/L orbit and legs.\nNo other serious medical conditions.",
    overview: [
      "Patient has eczema and asthma",
      "Allergic to dust, red meat, cocoa, meat with exoskeletons",
      "Allergic reactions often seen as asthma or itchiness in B/L orbit and legs.",
      "No other serious medical conditions",
    ],
  });

  let overView = userData.prev_cond.split(",");

  // image upload
  const FILESTACK_APIKEY = "AR9a0fhrDRleWdYYiy68qz";
  let [file_data, setFile_data] = useState({});
  let [img_up, setImg] = useState("");
  const client = filestack.init(FILESTACK_APIKEY);

  const fileSelectedHandler = (filedata) => {
    console.log(filedata);
    setFile_data(filedata);
  };
  const fileUploadHandler = async () => {
    console.log("Upload");
    if (file_data !== {}) {
      await client.upload(file_data).then(async (data) => {
        await apis
          .put(`user/${user_id}`, {
            img: data.url,
          })
          .then((data2) => {
            setImg(data.url);
            localStorage.setItem("user_img", data.url);
            console.log(data);
          })
          .catch((error) => console.log(error));
      });
    }
  };

  const fetchUserData = async () => {
    let results;
    await apis
      .get(`user/${user_id}`)
      .then((data) => {
        console.log(data.data);
        results = data.data;
      })
      .catch((error) => {
        console.log(error);
      });

    if (results !== null) {
      setUserData(results);
    }
  };

  //Prescription Fetching

  const [details, setDetails] = useState([]);
  console.log(details);

  const fetchPrescription = async () => {
    let result;
    await apis
      .get("prescription")
      .then((data1) => {
        console.log(data1.data);
        result = data1.data.filter((presC) => {
          return presC.user_id === user_id;
        });
      })
      .catch((error) => {
        console.log(error);
      });

    if (result !== null) {
      setDetails(result);
    }
  };

  //Appointment details Fetching

  const [details2, setDetails2] = useState([]);
  const [activeAppointments, setActiveAppointments] = useState([]);

  const appointmentData = async () => {
    let results;
    let results2;
    await apis
      .get("appointment")
      .then((data) => {
        // console.log(data.data);
        results = data.data.filter((doc) => {
          return doc.user_id === user_id;
        });
        results2 = data.data.filter((item) => {
          return item.user_id === user_id && item.status === "Active";
        });
      })
      .catch((error) => {
        console.log(error);
      });

    if (results.length !== 0) {
      const sorted = results.sort(function (a, b) {
        return Date(a.date) - Date(b.date);
      });
      sorted.sort(function (a, b) {
        return modifyTime(a.time, a.session) - modifyTime(b.time, b.session);
      });
      setDetails2(sorted);
      console.log(sorted);
    }

    if (results2.length !== 0) {
      const sorted2 = results2.sort(function (a, b) {
        return Date(a.date) - Date(b.date);
      });
      sorted2.sort(function (a, b) {
        return modifyTime(a.time, a.session) - modifyTime(b.time, b.session);
      });

      console.log("Sorted here");
      setActiveAppointments(sorted2);
    }
  };

  let modifyTime = (time, session) => {
    time = time + "";
    session = session;
    let [hours, min] = time.split(":");
    let hoursNum = parseInt(hours);
    if (session === "Afternoon") {
      hoursNum += 12;
    }
    let minNum = parseFloat(min) / 60;
    return hoursNum + minNum;
  };

  let [dependantData, setDependantData] = useState([]);

  const fetchDependant = async () => {
    let resultd;
    await apis
      .get("dependant")
      .then((datad) => {
        resultd = datad.data.filter((dep) => {
          return dep.user_id === user_id;
        });
      })
      .catch((error) => {
        console.log(error);
      });
    if (resultd !== null) {
      setDependantData(resultd);
    }
  };

  useEffect(() => {
    fetchUserData();
    const interval = setInterval(() => {
      fetchDependant();
    }, 1000 * 10);
    fetchDependant();
    appointmentData();
    fetchPrescription();
    // getDoctorDetails()

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [img_up]);

  let newRow = (e) => {
    return (
      <ul>
        <li>{e}</li>
      </ul>
    );
  };

  return (
    <div className="profile">
      <div
        className="modal fade modal-profile-img"
        id="profileModal"
        tabindex="-1"
        role="dialog"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <input
              type="file"
              onChange={(e) => {
                fileSelectedHandler(e.target.files[0]);
              }}
            />
            <button
              className="btn"
              data-bs-dismiss="modal"
              onClick={fileUploadHandler}
            >
              Upload
            </button>
          </div>
        </div>
      </div>
      <div></div>
      <div className="profile-div-left">
        <div className="container shadow profile-card1">
          <div className="profile-card1-grid">
            {userData.img === undefined ? (
              <img src={img} alt="" className="profile-card1-circle-avatar" />
            ) : (
              <img
                src={userData.img}
                alt=""
                className="profile-card1-circle-avatar"
              />
            )}
            <div className="profile-card1-top-right">
              <h3 className="profile-card1-name">{userData.name}</h3>
              <h6 className="profile-card1-dob">
                <span className="profile-card1-dob-helper">
                  Date of Birth:{" "}
                </span>
                {userData.dob}
              </h6>
              <h6 className="profile-card1-gender">
                <span className="profile-card1-gender-helper">Gender: </span>
                {userData.gender}
              </h6>
              <button
                className="btn profile-card1-edit-button"
                data-bs-toggle="modal"
                data-bs-target="#profileModal"
              >
                edit profile
              </button>
            </div>
          </div>
          <hr />
          <h6 className="profile-card1-details">
            <span className="profile-card1-details-helper">Email: </span>
            {userData.email}
          </h6>
          <h6 className="profile-card1-details">
            <span className="profile-card1-details-helper">
              Mobile number:{" "}
            </span>
            +91 {userData.phoneNumber}
          </h6>
          <h6 className="profile-card1-details">
            <span className="profile-card1-details-helper">Address: </span>
            {userData.address}
          </h6>
          <h6 className="profile-card1-details">
            <span className="profile-card1-details-helper">
              Previous Doctors:{" "}
            </span>
            {userData.prev_docs}
          </h6>
          <h6 className="profile-card1-details">
            <span className="profile-card1-details-helper">
              Previous Conditions:{" "}
            </span>
            {userData.prev_cond}
          </h6>
        </div>
        <div className="container shadow dependents-card">
          <h5>Registered Dependants</h5>
          <hr className="dependants-card-hr" />
          {dependantData.map((itemd) => {
            console.log(dependantData);
            return (
              <DependantCard
                onClicked={(id) => {
                  console.log(dependantData);
                  const res = dependantData.filter((item) => {
                    return item._id !== id;
                  });
                  setDependantData(res);
                }}
                id={itemd._id}
                name={itemd.name}
                rel={itemd.relationship}
                phone={itemd.phoneNumber}
              />
            );
          })}
          <button
            className="btn dependents-card-btn"
            onClick={() => setButtonPopup(true)}
          >
            Add Dependant
          </button>
          <Popup
            onClicked={(addedDependant) => {
              const newDep = [...dependantData, addedDependant];
              setDependantData(newDep);
            }}
            trigger={buttonPopup}
            setTrigger={setButtonPopup}
          />
        </div>
      </div>
      <div className="profile-div-right">
        <div className="container shadow profile-tabbar-container">
          <ul
            className="nav nav-pills mb-3 profile-tabbar"
            id="pills-tab"
            role="tablist"
          >
            <li className="nav-item" role="presentation">
              <button
                className="nav-link active profile-tabbar-tab"
                id="pills-home-tab"
                data-bs-toggle="pill"
                data-bs-target="#pills-home"
                type="button"
                role="tab"
                aria-controls="pills-home"
                aria-selected="true"
              >
                All
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                className="nav-link profile-tabbar-tab"
                id="pills-profile-tab"
                data-bs-toggle="pill"
                data-bs-target="#pills-profile"
                type="button"
                role="tab"
                aria-controls="pills-profile"
                aria-selected="false"
              >
                Appointments
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                className="nav-link profile-tabbar-tab"
                id="pills-contact-tab"
                data-bs-toggle="pill"
                data-bs-target="#pills-contact"
                type="button"
                role="tab"
                aria-controls="pills-contact"
                aria-selected="false"
              >
                History
              </button>
            </li>
          </ul>
        </div>
        <div>
          <div
            className="tab-content profile-tabbar-contents-container"
            id="pills-tabContent"
          >
            <div
              className="tab-pane fade show active profile-tabbar-content-all-tab"
              id="pills-home"
              role="tabpanel"
              aria-labelledby="pills-home-tab"
            >
              <div className="container shadow profile-tabbar-content-all-tab-overview-container">
                <h5>Overview</h5>
                <hr />
                {overView.length !== 0 ? (
                  overView.map((item) => {
                    return newRow(item);
                  })
                ) : (
                  <div style={{ textAlign: "center" }}>No Overview Given</div>
                )}
              </div>
              <div className="container shadow profile-tabbar-content-all-tab-appointments-container">
                <h5>Latest Appointment</h5>
                <hr />
                {activeAppointments.length !== 0 ? (
                  <AppointmentCard
                    uName={userData.name}
                    _id={activeAppointments[0]._id}
                    use_id={activeAppointments[0].user_id}
                    doctor_id={activeAppointments[0].doctor_id}
                    date={activeAppointments[0].date}
                    session={activeAppointments[0].session}
                    time={activeAppointments[0].time}
                    status={activeAppointments[0].status}
                    onClicked={(id)=>{
                      const res = activeAppointments.filter((item)=>{
                        return item._id !== id;
                      });
                      setActiveAppointments(res);
                      const res2 = details2.filter((item) => {
                        return item._id !== id;
                      });
                      setDetails2(res2);
                    }}
                  />
                ) : (
                  <div style={{ textAlign: "center" }}>
                    No recent Appointments
                  </div>
                )}
              </div>
              <div className="container shadow profile-tabbar-content-all-tab-history-container">
                <h5>History</h5>
                <hr />
                <div
                  id="accordion"
                  className="profile-tabbar-content-all-tab-history-accordion"
                >
                  {details.length !== 0 ? (
                    details.slice(0, 3).map((item3) => {
                      return (
                        <PrescriptionCard
                          _id={item3._id}
                          use_id={item3.user_id}
                          doc_id={item3.doctor_id}
                          date={item3.date}
                          blood_p={item3.blood_pressure}
                          body_t={item3.body_temperature}
                          blood_o={item3.blood_oxygen}
                          blood_s={item3.blood_sugar}
                          observation={item3.observation}
                          prescription={item3.prescription}
                        />
                      );
                    })
                  ) : (
                    <div style={{ textAlign: "center" }}>
                      No patient history available
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div
              className="tab-pane fade"
              id="pills-profile"
              role="tabpanel"
              aria-labelledby="pills-profile-tab"
            >
              <div className="container shadow profile-tabbar-content-all-tab-appointments-container">
                <h5 className="profile-tabbar-content-appointments-tab-container-h5">
                  Appointments
                </h5>
                <hr />
                <div className="profile-tabbar-content-appointments-tab-container">
                  {details2.map((item4) => {
                    return (
                      <AppointmentCard
                        uName={userData.name}
                        _id={item4._id}
                        use_id={item4.user_id}
                        doctor_id={item4.doctor_id}
                        date={item4.date}
                        session={item4.session}
                        time={item4.time}
                        status={item4.status}
                        onClicked={(id)=>{
                          const res = details2.filter((item) => {
                            return item._id !== id;
                          });
                          setDetails2(res);

                          const res2 = activeAppointments.filter((item) => {
                            return item._id !== id;
                          });
                          setActiveAppointments(res2);
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
            <div
              className="tab-pane fade"
              id="pills-contact"
              role="tabpanel"
              aria-labelledby="pills-contact-tab"
            >
              <div className="container shadow profile-tabbar-content-all-tab-history-container">
                <h5>History</h5>
                <hr />
                <div
                  id="accordion"
                  className="profile-tabbar-content-all-tab-history-accordion"
                >
                  {details
                    .filter((item1) => {
                      return item1.user_id === user_id;
                    })
                    .map((item) => {
                      return (
                        <PrescriptionCard
                          _id={item._id}
                          use_id={item.user_id}
                          doc_id={item.doctor_id}
                          date={item.date}
                          blood_p={item.blood_pressure}
                          body_t={item.body_temperature}
                          blood_o={item.blood_oxygen}
                          blood_s={item.blood_sugar}
                          observation={item.observation}
                          prescription={item.prescription}
                        />
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
