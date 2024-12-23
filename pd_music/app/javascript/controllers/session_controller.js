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
      if (session_timeout >= 3600){
          document.getElementById("session-timeout-btn").click();
          let url = application_path.value+"/login/logout?state=session_timeout";
          const forgot_password = fetch(url).then(response => {
            if (response.ok) {
                return response.text();
            }
          });
          let countdown = parseInt(document.getElementById("countdown-logout").innerHTML);
          const force_redirect = setInterval(function (){
            countdown -= 1
            document.getElementById("countdown-logout").innerHTML = countdown;
            if (countdown == 0){
              window.location.replace(application_path.value+"/login");
              clearInterval(force_redirect);
            }
          }, 1000);
          clearInterval(counter);
      }
        
    }, 1000);
  }
}
