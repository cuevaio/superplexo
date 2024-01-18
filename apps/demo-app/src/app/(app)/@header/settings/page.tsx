import { DarkModeSwitch } from "./dark-mode-switch";

const SettingsHeader = () => {
  return (
    <div className="flex justify-between items-center">
      <h1>Settings</h1>
      <DarkModeSwitch />
    </div>
  );
}

export default SettingsHeader;



