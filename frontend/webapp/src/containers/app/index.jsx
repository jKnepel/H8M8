import { showNotification } from "@mantine/notifications";
import moment from "moment";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { BrowserRouter as Router } from "react-router-dom";
import RoutesManager from "../../components/routes_manager";
import { selectError } from "../../redux/ducks/auth-duck/auth.duck.selectors";
import { ExclamationMark } from "tabler-icons-react";
import "./style.scss";

const App = () => {
  const error = useSelector(selectError);

  useEffect(() =>{
    if(!error) return;
    showNotification({
      id: `error-notification-${moment().utc()}`,
      disallowClose: false,
      autoClose: 10000,
      title: "Error",
      message: `${error?.name}: ${error?.message}`,
      color: "red",
      icon: <ExclamationMark size={18} />,
    });
  }, [error]);

  return (
    <div className="wsb-app-container">
      <Router>
        <RoutesManager />
      </Router>
    </div>
  );
};

export default App;
