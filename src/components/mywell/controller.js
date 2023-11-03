export async function getNovusData(
  setCaudal,
  setNivel,
  state,
  api_novus,
  setAcumulado,
  acumulado,
  nivel
) {
  const rqCaudal = await api_novus
    .lastData(
      state.selected_profile.title == "POZO 2"
        ? "3grecuc2v"
        : state.selected_profile.title == "Las Pircas"
        ? "3grecuc2v"
        : state.selected_profile.title == "Paine"
        ? "wifia1va"
        : state.user.id == 32
        ? "3grecuc2v"
        : state.user.id == 34
        ? "3grecuc2v"
        : "3grecuc1v",
      state.selected_profile.token_service
    )
    .then((x) => {
      
      
        if (x.data.result[0].value > 0) {
          if(state.user.username=='cocacolatemuco'){
            setCaudal(0)
          } else {
            setCaudal(x.data.result[0].value);
          }
          
        } 

      
      
    })
    .catch((e) => {
      if(state.user.username=='cocacolatemuco'){
        setCaudal(0)
      } 
      setCaudal(0.0);
    });
  const rqNivel = await api_novus
    .lastData(
      state.selected_profile.title == "POZO 3" || state.selected_profile.title == "POZO 2"
        ? "3grecuc1v"
        : state.selected_profile.title == "Las Pircas"
        ? "3grecuc1v"
        : state.selected_profile.title == "Paine"
        ? "wifia2va"
        : state.user.id == 32
        ? "3grecuc1v"
        : state.user.id == 34
        ? "3grecuc1v"
        :  state.user.username === 'cocacolatemuco' ? state.selected_profile.title == "Pozo 1" ? '3grecuc1v':'3grecuc1v':"3grecuc2v",         
      state.selected_profile.title == "POZO 3"  
        ? "321bbb98-4579-4c63-b93f-ecad987b2abf"
        : state.selected_profile.title == "POZO 2"
        ? "6c1b1ad5-4103-43a3-b594-bf1e998d094c"
        : state.user.username === 'cocacolatemuco' & state.selected_profile.title == "Pozo 1" ? 
        '1614c57e-e4ac-4770-a776-97d4f9026a5c':
        state.selected_profile.token_service
    )
    .then((x) => {
      if (x.data.result[0].value > 0) {
        setNivel(x.data.result[0].value);
      } else {
        setNivel(0.0);
      }
    })
    .catch((e) => {
      setNivel(0.0);
    });
  const rqAcumulado = await api_novus
    .lastData(
      state.selected_profile.title == "Paine" ? "wifiaccva" : state.user.username === 'cocacolatemuco'?'3grecdi1va':"3grecdi1va",
      state.selected_profile.token_service
    )
    .then(async (x) => {
      setAcumulado(
        parseInt(x.data.result[0].value / state.selected_profile.scale)
      );
      var nowDate = new Date();
      var antHour = 0;
      var date = `${nowDate.getFullYear()}-${
        nowDate.getMonth() + 1 > 9
          ? nowDate.getMonth() + 1
          : `0${nowDate.getMonth() + 1}`
      }-${
        nowDate.getDate() - 1 > 9
          ? nowDate.getDate() - 1
          : `0${nowDate.getDate() - 1}`
      }T00:00:00`;

      const rq2 = await api_novus
        .data("3grecdi1va", "", date, state.selected_profile.token_service)
        .then(
          (x) => antHour = parseInt(
              x.result[0].value / state.selected_profile.scale
          )
        );
      var diff = parseInt(x.data.result[0].value / state.selected_profile.scale) - antHour;

    })
    .catch((e) => {
    });
  return {
    rqCaudal,
    rqNivel,
    rqAcumulado,
  };
}
