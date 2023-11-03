import { GET } from './config'

const getData = async(variable, start_date, end_date, token) =>{

    if(!end_date){
        end_date=''
    }
    console.log(variable)
   try {
        const request = await GET(`?variable=${variable}&start_date=${start_date}&end_date=${end_date}&query=last_item`, token)        
        return request.data        
   } catch(err) {
       console.log(err)
   }
}

const getDataForCaudal = async(variable, start_date, end_date, token) =>{

    if(!end_date){
        end_date=''
    }
    console.log(variable)
   try {
        const request = await GET(`?variable=${variable}&qty=2`, token)        
        return request.data        
   } catch(err) {
       console.log(err)
   }
}

const getLastData = async(variable,token) => {
    try {
        const request = await GET(`?variable=${variable}&query=last_item`, token)
        return request
    } catch(err) {
        console.log(err)
    } 
}

const getLastDataHour = async(variable,token) => {
    
    var nowDate = new Date()
    var listData = []

    for(var i =0 ; i < 25; i++){
        
        var date = `${nowDate.getFullYear()}-${nowDate.getMonth()+1>9?nowDate.getMonth()+1: `0${nowDate.getMonth()+1}`}-${nowDate.getDate()-1>9?nowDate.getDate()-1:`0${nowDate.getDate()-1}`}T${i>=10?i:`0${i}`}:00:00`        
        const request = await GET(`?variable=${variable}&query=last_item&end_date=${date}`, token)
        listData.push({
            date: i === 24 ? '24 hrs':`${date.slice(11,13)} hrs`,
            m3:request.data.result[0] ? parseInt(request.data.result[0].value) : parseInt(0)
        })                
    }

    
    return(listData)

//    console.log(nowDate.toISOString())
//    console.log(nowDate.setHours(-1))
//    console.log(nowDate.toISOString())

    
}

const getMonth = async(variable,token) => {
    

    var nowDate = new Date()
    var listData = []
    var lastDay = new Date(nowDate.getFullYear(), nowDate.getMonth(), 0)
        

    for(var i =0 ; i < nowDate.getDate(); i++){
        var date = `${nowDate.getFullYear()}-${nowDate.getMonth()+1>9? nowDate.getMonth()+1:`0${nowDate.getMonth()+1}`}-${i}`        
        if(i === 0){
            if(nowDate.getMonth()+1 === 1){
                date = `${nowDate.getFullYear()-1}-12-${lastDay.getDate()}`        
            } else{
                
                date = `${nowDate.getFullYear()}-${nowDate.getMonth()+1 > 9 ? 
                    nowDate.getMonth():`0${nowDate.getMonth()}`
                }-${lastDay.getDate()}`        
console.log(lastDay.getDate())
            }          
        }
        const request = await GET(`?variable=${variable}&query=last_item&end_date=${date}`, token)
        listData.push({
            date:i,
            m3: request.data.result[0] ? 
                    parseInt(request.data.result[0].value):parseInt(0)
        })                
        
    }
  console.log(listData)

    return(listData)


    
}

const getMonthLevel = async(variable,token) => {    
    var nowDate = new Date()
    var listData = []
    for(var i =0 ; i < nowDate.getDate(); i++){        
        var date = `${nowDate.getFullYear()}-${nowDate.getMonth() > 9 ? nowDate.getMonth()+1:`0${nowDate.getMonth()+1}` }-${nowDate.getDate() > 9 ? i+1:`0${i+1}`}`                
        const request = await GET(`?variable=${variable}&query=last_item&end_date=${date}`, token)

        listData.push({
            date: `${i+1}`,
            'm/dia': request.data.result[0] ? 
                    request.data.result[0].value > 0  && request.data.result[0].value > 50 ? 50.0 :
                request.data.result[0].value
                : 0.0
        })                        
    }    
    return(listData)    
}

const getMonthInd1 = async(variable,token) => {
    var nowDate = new Date()
    var listData = []
    
    nowDate.setDate(nowDate.getDate()-7)

    for(var i =0 ; i < 9; i++){
        
        var date = `${nowDate.getFullYear()}-${nowDate.getMonth()+1}-${nowDate.getDate()-i}`        
        
        
        const request = await GET(`?variable=${variable}&query=last_item&end_date=${date}`, token)
        
        listData.push({
            date: date,
            m3: request.data.result[0] ? 
                    request.data.result[0].value
                : 0
        })                
        
    }
    
    return(listData)


    
}

const getMonthInd2 = async(variable,token) => {
    var nowDate = new Date()
    var listData = []
    
    nowDate.setDate(nowDate.getDate()-7)

    for(var i =0 ; i < 9; i++){
        
        var date = `${nowDate.getFullYear()}-${nowDate.getMonth()+1}-${nowDate.getDate()-i}`        
        
        
        const request = await GET(`?variable=${variable}&query=last_item&end_date=${date}`, token)
   
        listData.push({
            date: date,
            mt: request.data.result[0] ? 
                    request.data.result[0].value > 50 ? parseFloat(50): request.data.result[0].value
                : 0
        })                
        
    }
    
    return(listData)


    
}



const api_novus = {
    data: getData,
    dataCaudal: getDataForCaudal,
    lastData: getLastData,
    lastDataForHour: getLastDataHour,
    getMontData: getMonth,
    getMontDataLevel: getMonthLevel,
    ind1: getMonthInd1,
    ind2: getMonthInd2
}


export default api_novus
