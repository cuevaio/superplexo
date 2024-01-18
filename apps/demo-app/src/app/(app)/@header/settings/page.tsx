import { ThemeToggle } from "./theme-toggle";

const SettingsHeader = () => {
  return (
    <div className="flex justify-between items-center">
      <h1>Settings</h1>
      <ThemeToggle />
    </div>
  );
}

export default SettingsHeader;



