const button = document.getElementById("submitButton1")
const userId = button.value
const container = document.getElementById("feeds")
const form = document.getElementById("formforUploads")
if (form) {
    form.addEventListener('submit', (e) => {
        e.preventDefault()
        fetch(`/client/uploads/${userId}`)
            .then(res => { return res.json() })
            .then(data => {
                console.log(data)
                data.forEach(object => {
                    const temp1 = '<form action = /client/downloads/' + object.filename + ' method="get"><button type="submit" class="button is-info is-light">'
                    const title = temp1 + 'DOWNLOAD' + '</button></form>'
                    const path = object.filename
                    const temp2 = '<object data=/' + path + ' height="300" width="300">'
                    const temp3 = '<form action = /client/delete/' + object.filename + ' method="get"><button type="submit" class="button is-danger is-light">DELETE</button><form>'
                    container.insertAdjacentHTML("beforeend", title)
                    container.insertAdjacentHTML("beforeend", temp3)
                    container.insertAdjacentHTML("beforeend", temp2)
                    if (object.reported) {
                        const reportTag = `<div class="icon-text">
                        <span class="icon has-text-danger">
                          <i class="fas fa-ban"></i>
                        </span>
                        <span>REPORTED BY ADMIN</span>
                      </div>`
                        container.insertAdjacentHTML("beforeend", reportTag)
                    }


                    container.insertAdjacentHTML("beforeend", `<hr style="height: 5px;
                    background: teal;
                    margin: 20px 0;
                    box-shadow: 0px 0px 4px 2px rgba(204,204,204,1);">`)

                });
            })
            .catch(err => console.log(err))
        // button.style.backgroundColor= '#911'
        // console.log(userId)



    })

}

document.addEventListener('DOMContentLoaded', () => {
    // Functions to open and close a modal
    function openModal($el) {
      $el.classList.add('is-active');
    }
  
    function closeModal($el) {
      $el.classList.remove('is-active');
    }
  
    function closeAllModals() {
      (document.querySelectorAll('.modal') || []).forEach(($modal) => {
        closeModal($modal);
      });
    }
  
    // Add a click event on buttons to open a specific modal
    (document.querySelectorAll('.js-modal-trigger') || []).forEach(($trigger) => {
      const modal = $trigger.dataset.target;
      const $target = document.getElementById(modal);
  
      $trigger.addEventListener('click', () => {
        openModal($target);
      });
    });
  
    // Add a click event on various child elements to close the parent modal
    (document.querySelectorAll('.modal-background, .modal-close, .modal-card-head .delete, .modal-card-foot .button') || []).forEach(($close) => {
      const $target = $close.closest('.modal');
  
      $close.addEventListener('click', () => {
        closeModal($target);
      });
    });
  
    // Add a keyboard event to close all modals
    document.addEventListener('keydown', (event) => {
      const e = event || window.event;
  
      if (e.keyCode === 27) { // Escape key
        closeAllModals();
      }
    });
  });



// function show(){

// }

