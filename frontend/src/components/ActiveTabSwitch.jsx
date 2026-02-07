// frontend/src/components/ActiveTabSwitch.jsx
import ActiveTab from './ActiveTab';

function ActiveTabSwitch() {
  return (
    <div role="tablist" className="tabs tabs-boxed bg-transparent flex-row">
      <ActiveTab activeTabName="chats">Chats</ActiveTab>
      <ActiveTab activeTabName="contacts">Contacts</ActiveTab>
    </div>
  );
}
export default ActiveTabSwitch;
