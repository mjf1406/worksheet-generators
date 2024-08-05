import React from "react";
import "./GoogleButton.css";
import GoogleLogo from "./GoogleLogo";

// Define an interface for the component props
interface GoogleButton {
  text: string; // Only one prop, 'text', which is a string
}

const GoogleButton: React.FC<GoogleButton> = ({ text }) => {
  return (
    <button className="gsi-material-button">
      <div className="gsi-material-button-state"></div>
      <div className="gsi-material-button-content-wrapper">
        <div className="gsi-material-button-icon">
          <GoogleLogo />
        </div>
        <span className="gsi-material-button-contents">{text}</span>
      </div>
    </button>
  );
};

export default GoogleButton;
