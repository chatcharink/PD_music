import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  connect() {
    this.session_count(0);

    // document.querySelectorAll("p").addEventListener("click", myFunction);
  }

  session_count(session_timeout){
    const counter = setInterval(function () {
      session_timeout += 1;
      let application_path = document.getElementById("application-path");
      // console.log(session_timeout);
      if (session_timeout >= 3600){
          document.getElementById("session-timeout-btn").click();
          let url = application_path.value+"/login/logout?state=session_timeout";
          const forgot_password = fetch(url).then(response => {
            if (response.ok) {
                return response.text();
            }
          });
          clearInterval(counter);
      }
        
    }, 1000);
  }
}
