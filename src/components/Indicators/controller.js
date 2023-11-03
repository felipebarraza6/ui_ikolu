export async function getNovusData1( state, setInd1, setInd2, api_novus, setLoad){
    
        const rqGetDataMont = await api_novus.ind1('3grecdi1va', state.selected_profile.token_service).then((x)=>{
            setLoad(true)
            //setInd1(x)
            for(var i=0;i<x.length; i++){
                if(x[i+1]){
                    x[i] = {
                        m3: parseFloat(parseInt(x[i].m3-x[i+1].m3)/state.selected_profile.scale).toFixed(0), 
                        date:x[i].date
                    }
                }                
            }
            x.pop()
            var max_int = Math.max(...x.map(o => o.m3)) 
            x.map(y=> { 
              if(y.m3 == max_int){
                return(x=y)
              }
            })
          setInd1([x])
        }).catch((e)=>{            
            console.log(e)
            
        })
    
    
    
   const rqNivel = await api_novus.ind2(
            state.selected_profile.title=='POZO 3' || state.selected_profile.title=='POZO 2'  ? 
                '3grecuc1v':state.selected_profile.title=='Nueva Energia' ? '3grecuc2v':'3grecuc1v', 
            state.selected_profile.title=='POZO 3'? 
                '321bbb98-4579-4c63-b93f-ecad987b2abf':
                state.selected_profile.title=='POZO 2'? 
                '6c1b1ad5-4103-43a3-b594-bf1e998d094c':
                state.selected_profile.token_service
            ).then((x)=>{
              const nowData = new Date().getDate()
              var max_int = Math.min(...x.map(o => o.mt)) 
              x.map(y=> { 
              if(y.mt == max_int){
                return(x=y)
              }
            })
              console.log(x)
              setInd2([x])
              setLoad(false)
        }).catch((e)=>{
          console.log(e)
        })
    
}
