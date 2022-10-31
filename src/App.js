import { utils } from 'ethers';
import React from 'react';
import { signer, connectWallet, createService, requestService, withdrawRequest, acceptRequest, changeOutcome, claim } from "./chain/chain.js";
import { findServicesID, getConfirmations, getName, getLocation, getPaymentWei, getWallet, getDistrust, getCompletions, getEmail } from "./chain/chain.js";
import './index.css';

class App extends React.Component {

  tab(hidden, shown) {
    for (let i=0; i < hidden.length; i++) {
      hidden[i].style.display = "none";
    }
    document.getElementsByClassName('serviceBoxes')[0].style.display = "none";
    for (let i=0; i < shown.length; i++) {
      shown[i].style.display = "block";
    }
  }

  async search(maxSearch, firstID) {
    let searches = document.getElementById("search").value.split(', ');
    let foundIDs = [];
    for (let i=0; i < searches.length; i++) {
      foundIDs[i] = await findServicesID(searches[i].toString(), maxSearch, firstID);
    }
    if (foundIDs.length === 0) {
      document.getElementsByClassName('serviceBoxes')[0].style.display = "none";
      return console.log("no services found");
    }

    let boxAmt = document.getElementsByClassName('serviceBox').length;
    if (boxAmt > 0) {
      for (let i=0; i < boxAmt; i++) {
        document.getElementsByClassName('serviceBoxes')[0].removeChild(document.getElementsByClassName('serviceBox')[0]);
      }
    }

    let usedIDs = [];
    let unused = true;
    for(let i=0; i < foundIDs.length; i++) {
      for(let j=0; j < foundIDs[i].length; j++) {
        for(let k=0; k < usedIDs.length; k++) {
          if (usedIDs[k] === foundIDs[i][j].toString()) {
            unused = false;
            break;
          }
        }
        if (unused) {
          let fID = foundIDs[i][j].toString();
          let e = document.createElement('serviceBox');
          let name = document.createElement('name');
          let location = document.createElement('location');
          let payment = document.createElement('payment')
          let wallet = document.createElement('wallet');
          let distrust = document.createElement('distrust');
          let completions = document.createElement('completions');
          let email = document.createElement('email');
          let ID = document.createElement('ID');
          e.setAttribute("class", "serviceBox");
          name.innerHTML = "name: " + await getName(fID);

          location.innerHTML = "location: " + await getLocation(fID);
          payment.innerHTML = "payment: " + await getPaymentWei(fID)/10**18 + " ETH";
          wallet.innerHTML = "wallet: " + await getWallet(fID);
          wallet.style.fontSize = "4px";
          distrust.innerHTML = "distrust: " + await getDistrust(fID);
          completions.innerHTML = "fulfillments: " + await getCompletions(fID);
          email.innerHTML = "email: " + await getEmail(fID);
          ID.innerHTML = "ID: " + fID;

          e.appendChild(name);
          e.appendChild(location);
          e.appendChild(payment);
          e.appendChild(wallet);
          e.appendChild(distrust);
          e.appendChild(completions);
          e.appendChild(email);
          e.appendChild(ID);
          document.getElementsByClassName('serviceBoxes')[0].appendChild(e);
          document.getElementsByClassName('serviceBoxes')[0].style.display = "block";
          usedIDs.push(fID);
        }
      }
    }
  }

  render() {
    return (
      <div className="App">
        <ul id='ul'>
          <li><div onClick={(e) => {
            this.tab(document.getElementsByClassName('bubble'), [document.getElementById('searchBubble'), document.getElementById('confirmationsBubble'), document.getElementsByClassName('serviceBoxes')[0]]);
            e.preventDefault();
          }}>search</div></li>
          <li><div onClick={(e) => {
            this.tab(document.getElementsByClassName('bubble'), [document.getElementById('requestBubble'), document.getElementById('claimBubble')]);
            e.preventDefault();
          }}>client hub</div></li>
          <li><div onClick={(e) => {
            this.tab(document.getElementsByClassName('bubble'), [document.getElementById('createServiceBubble'), document.getElementById('acceptRequestBubble'), document.getElementById('claimBubble')]);
            e.preventDefault();
          }}>service hub</div></li>
          <li style={{float: "right"}}><div id='infoToggle' onClick={async() => {
            let b = document.getElementsByClassName('title');
            let on = 'rgb(228, 146, 80)';
            let off = 'var(--color3)';
            var toggleInfo = b[0].style.color === on;
            for (let i=0; i < b.length; i++) {
              if (toggleInfo) {
                b[i].style.color = off;
                document.getElementById('infoToggle').style.backgroundColor = '';
              } else {
                b[i].style.color = on;
                document.getElementById('infoToggle').style.backgroundColor = on;
              }
            }
          }}>info</div></li>
          <li style={{float: "right"}}><div id='connectButton' onClick={async() => {
            if (connectWallet()) {
              document.getElementById('connectButton').style.color = getComputedStyle(document.getElementById('ul')).getPropertyValue("--color1");
            }}}>connect wallet</div></li>
        </ul>

        <br></br><br></br><br></br><br></br><br></br>

        <div className='all'>

          <div className='bubble' id='searchBubble'>
            <div className='title' onClick={async() => {
              let toggleInfo = document.getElementById('infoToggle').style.backgroundColor !== '';
              if (toggleInfo) {
                alert('search for a service:\n1: search by name, email, location, wallet, or tags\n2: maximum amount of searches per phrase (phrase1, phrase2, ...)\n3: begin search starting with this ID (use 0 by default)');
              } else {
                this.search(document.getElementById('maxSearch').value.toString(), document.getElementById('firstID').value.toString());
              }}}>search</div>
            <input className='input' id='search' type="text" placeholder="search: by name, location, or wallet"></input>
            <input className='input' id='maxSearch' type="number" min="1" placeholder="maximum searches"></input>
            <input className='input' id='firstID' type="number" min="1" placeholder="first ID: start with this ID"></input>
          </div>

          <div className='bubble' id='confirmationsBubble'>
            <div className='title' onClick={async() => {
              let toggleInfo = document.getElementById('infoToggle').style.backgroundColor !== '';
              if (toggleInfo) {
                alert('find out the status of both the client and service:\nhas the other party approved or denied the completion of the service?');
              } else {
                getConfirmations(document.getElementById('confirmationsID').value.toString(), document.getElementById('confirmationsWallet').value.toString());
              }}}>look up status</div>
            <input className='input' id='confirmationsWallet' type="text" placeholder="client wallet"></input>
            <input className='input' id='confirmationsID' type="number" min="1" placeholder="service ID"></input>
          </div>

          <div className='bubble' id='requestBubble'>
            <div className='title' onClick={async() => {
              let toggleInfo = document.getElementById('infoToggle').style.backgroundColor !== '';
              if (toggleInfo) {
                alert('how to become a client:\n1: use search to find service ID\n2: contact the service provider through email\n3: request service with ID');
              } else {
                requestService(document.getElementById('requestID').value.toString());
              }}}>request service</div>
              <div className='title' onClick={async() => {
                let toggleInfo = document.getElementById('infoToggle').style.backgroundColor !== '';
                if (toggleInfo) {
                  alert('you may cancel the request for a full refund before the request is accepted. otherwise the proccess will continue');
                } else {
                withdrawRequest(document.getElementById('requestID').value.toString());
              }}}>withdraw request</div>
            <input className='input' id='requestID' type="text" min="1" placeholder="service ID"></input>
          </div>

          <div className='bubble' id='createServiceBubble'>
            <div className="title" onClick={async() => {
              let toggleInfo = document.getElementById('infoToggle').style.backgroundColor !== '';
              if (toggleInfo) {
                alert('the service provider has the power in a dispute. if the service and client disagree on the outcome, the service will still receive the payment but gains a distrust point. the distrust/fulfillment ratio can be found within search');
              } else {
                try {
                  let n = document.getElementsByName('createServiceInput');
                  let tags = n[1].value.toString().split(', ');
                  createService(n[0].value, [tags[0], tags[1], tags[2]], n[2].value, signer.getAddress(), utils.parseEther((n[3].value).toString()), n[4].value);
                } catch {
                  alert('service must have 3 tags separated by ", "');
              }}}}>create service</div>
            <input className="input" name='createServiceInput' placeholder="service name: example"></input>
            <input className="input" name='createServiceInput' placeholder="3 search tags: ex1, ex2, ex3"></input>
            <input className="input" name='createServiceInput' placeholder="location: region"></input>
            <input className="input" name='createServiceInput' min="0" placeholder="payment in ETH: 0.1"></input>
            <input className="input" name='createServiceInput' placeholder="email: email@email.com"></input>
          </div>

          <div className='bubble' id='acceptRequestBubble'>
            <div className='title' onClick={async() => {
              let toggleInfo = document.getElementById('infoToggle').style.backgroundColor !== '';
              if (toggleInfo) {
                alert('to prevent trust exploits, there is a 6% fee on each accepted request. make sure the client is worthy of accepting through email');
              } else {
                acceptRequest(document.getElementById('acceptRequestID').value.toString(), document.getElementById('acceptRequestWallet').value.toString());
              }}}>accept request</div>
            <input className='input' id='acceptRequestWallet' type="text" placeholder="requested wallet"></input>
            <input className='input' id='acceptRequestID' type="number" min="1" placeholder="service ID"></input>
          </div>

          <div className='bubble' id='claimBubble'>
            <div className='title' onClick={async() => {
              let toggleInfo = document.getElementById('infoToggle').style.backgroundColor !== '';
              if (toggleInfo) {
                alert('after the service is provided, both parties should approve or deny the completion of the service. once a party claims, a 3 day timer begins. when the timer ends, the non-pending party can allocate the payment. ');
              } else {
                let b = true;
                if (document.getElementById('claimComplete').checked) {
                  b = false;
                }
                claim(document.getElementById('claimID').value.toString(), document.getElementById('claimWallet').value.toString(), b);
              }}}>claim</div>
            <div className='title' onClick={async() => {
              let toggleInfo = document.getElementById('infoToggle').style.backgroundColor !== '';
              if (toggleInfo) {
                alert('use the claim button first. if a mistake was made while claiming and the outcome has changed, use this button');
              } else {
              let b = true;
              if (document.getElementById('claimComplete').checked) {
                b = false;
              }
              changeOutcome(document.getElementById('claimID').value.toString(), document.getElementById('claimWallet').value.toString(), b);
              }}}>alter outcome</div>
            <input className='input' id='claimWallet' type="text" placeholder="client wallet"></input>
            <input className='input' id='claimID' type="number" min="1" placeholder="service ID"></input>
            <label htmlFor='claimComplete'>service incomplete<input className='input' id='claimComplete' type='checkbox' style={{padding: '0px'}}></input></label>
          </div>

          <br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br>
          <div className='serviceBoxes'></div>

        <script src="./chain/chain.js"></script>
        </div>
      </div>
    );
  }
}

export default App;
