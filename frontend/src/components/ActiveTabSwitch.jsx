// frontend/src/components/ActiveTabSwitch.jsx
import ActiveTab from './ActiveTab';

function ActiveTabSwitch() {
  return (
    <div id="active-tab-switch" role="tablist" className="tabs tabs-boxed bg-transparent flex-row">
      <ActiveTab testId="active-tab-chats" activeTabName="chats">
        Chats
      </ActiveTab>
      <ActiveTab testId="active-tab-contacts" activeTabName="contacts">
        Contacts
      </ActiveTab>
    </div>
  );
}
export default ActiveTabSwitch;
