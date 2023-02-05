const adminshowuploadButton = document.getElementById("alluploadbutton")
const admincontainer = document.getElementById("alluploads")



if(adminshowuploadButton){
    adminshowuploadButton.addEventListener('click', (e)=>{
        e.preventDefault()
        fetch("/client/alluploads")
        .then(res => { return res.json() })
        .then(data =>{
            // console.log(data)
            for(const key in data){
                const file_name = key
                // console.log(key)
                const temp1 = '<form action = /client/downloads/' + file_name + ' method="get"><button type="submit" class="button is-info is-light">'
                const title = temp1 + 'Download'+ '</button></form>'
                const x = '<form action = /client/report/' + file_name + ' method="get"><button type="submit" class="button is-warning is-light">'
                const temp3 =  x+'REPORT</button></form>'
                const title1 = title+temp3
                const fileTopath = `/${file_name}`
                const temp2 = '<object data='+fileTopath+ ' height="300" width="300">'
                admincontainer.insertAdjacentHTML("beforeend", title1)
                admincontainer.insertAdjacentHTML("beforeend", temp2)
                admincontainer.insertAdjacentHTML("beforeend", `<hr style="height: 5px;
                background: teal;
                margin: 20px 0;
                box-shadow: 0px 0px 4px 2px rgba(204,204,204,1);">`)
            }
        })

    })
}