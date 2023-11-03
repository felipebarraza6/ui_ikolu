
import React, { useState, useEffect } from 'react'
import { Row, Col, Typography, Card, Statistic, Input, Button, Table  } from 'antd'
import {UserOutlined, ClockCircleFilled, ArrowLeftOutlined } from '@ant-design/icons'
import logo from '../assets/images/logozivo.png'
import wallpaper  from '../assets/images/walldga.png'
import { Link } from "react-router-dom"
import minLogo  from '../assets/images/min_logo.png'

import caudal_img  from '../assets/images/caudal.png'
import nivel_img  from '../assets/images/nivel.png'
import acumulado_img  from '../assets/images/acumulado.png'
import pozo1  from '../assets/images/pozo1.png'
import { Area, Line } from '@ant-design/plots'
import g1 from '../assets/images/g1.png'
import qr from '../assets/images/qr.png'


import kpi1_1 from '../assets/images/kpi1/1.png'
import kpi1_2 from '../assets/images/kpi1/2.png'
import kpi1_3 from '../assets/images/kpi1/3.png'
import kpi1_4 from '../assets/images/kpi1/4.png'
import kpi1_5 from '../assets/images/kpi1/5.png'
import kpi1_6 from '../assets/images/kpi1/6.png'
  
  
const { Title:TitleTy } =Typography
const { Countdown } = Statistic;

const Dga = () => {

    const deadline = Date.now() + 10 * 1 * 60 * 24 * 2 + 1000 * 30; // Moment is also OK
    const [option, setOption] = useState(0)

    const Well = () => {
        return(
            <Row>
                 <Col span={5}>
                    <TitleTy level={2}>Mi Pozo</TitleTy>
                </Col>
                <Col span={13} offset={17} style={{marginTop:'-50px'}}>                                    
                                    <Countdown format="HH:mm:ss:SSS" title="Tiempo para Sincronización" value={deadline} prefix={<ClockCircleFilled />} />                                
                                </Col>
                                <Col span={12} style={{marginLeft:'-40px'}}>                                    
                                    <Card hoverable style={{marginBottom:'10px', marginTop:'20px', border:'solid 1px grey', borderRadius:'15px'}}>
                                        <Row align='middle'>
                                            <Col span={7}><img src={caudal_img} width='60px'  /></Col>
                                            <Col span={12}><TitleTy level={5} style={{color:'#222221'}}>Caudal</TitleTy></Col>
                                            <Col span={12} offset={7} style={{marginTop:'-15px'}}><Typography.Paragraph level={5}><b>51.5 (Litros)</b></Typography.Paragraph></Col>
                                        </Row>                                    
                                    </Card>
                                    <Card hoverable style={{marginBottom:'10px', marginTop:'20px', border:'solid 1px grey', borderRadius:'15px'}}>
                                        <Row align='middle'>
                                            <Col span={7}><img src={nivel_img} width='60px' /></Col>
                                            <Col span={12}><TitleTy level={5} style={{color:'#222221'}}>Nivel Freático</TitleTy></Col>                                            
                                            <Col span={12} offset={7} style={{marginTop:'-25px'}}><Typography.Paragraph level={5}><b>33.5 (Metros)</b></Typography.Paragraph></Col>
                                        </Row>                                    
                                    </Card>
                                    <Card hoverable style={{marginBottom:'50px', marginTop:'20px', border:'solid 1px grey', borderRadius:'15px'}}>
                                        <Row align='middle'>
                                            <Col span={7}><img src={acumulado_img} width='60px'  /></Col>
                                            <Col span={17}><TitleTy level={5} style={{color:'#222221'}}>Acumulado</TitleTy></Col>                                            
                                            <Col span={12} offset={7} style={{marginTop:'-25px'}}><Typography.Paragraph level={5}><b>35.179 (M3)</b></Typography.Paragraph></Col>
                                        </Row>                                    
                                    </Card>
                                </Col>
                                <Col span={12} style={{paddingLeft:'5px', paddingTop:'70px'}}>
                                    <center>
                                        <img src={pozo1} width={'330px'} style={{position:'absolute', marginLeft:'-140px'}} />                                        
                                    </center>
                                        <Input style={{width:'85px', marginTop:'80px', marginLeft:'50px', position:'absolute', borderRadius:'10px'}} value={'51.5 Ltrs'} />

                                        <Input style={{width:'90px', marginTop:'240px', marginLeft:'200px', position:'absolute', borderRadius:'10px'}} value={'33.5 Mtrs'}  />
                                        <Input style={{width:'95px', marginTop:'80px', marginLeft:'240px', position:'absolute', borderRadius:'10px'}} value={'35.179 M3'} />
                                </Col>
                                <Col>
                                </Col>
                            </Row>
        )
    }

    const Graphics = () => {
        
          
        const [option, setOption] = useState(0)
        
        const config = {
            data: [
                {timePeriod: '00:00', m3:0},
                {timePeriod: '01:00', m3:33},
                {timePeriod: '02:00', m3:40},
                {timePeriod: '03:00', m3:'30'},
                {timePeriod: '04:00', m3:'26'},
                {timePeriod: '05:00', m3:'46'},
                {timePeriod: '06:00', m3:'58'},
                {timePeriod: '07:00', m3:'66'},
                {timePeriod: '08:00', m3:'92'},
                {timePeriod: '09:00', m3:'42'},
                {timePeriod: '10:00', m3:'64'},
                {timePeriod: '11:00', m3:'16'},
                {timePeriod: '12:00', m3:'73'},
                {timePeriod: '13:00', m3:'55'},
                {timePeriod: '14:00', m3:'28'},
                {timePeriod: '15:00', m3:'12'},
                {timePeriod: '16:00', m3:'63'},
                {timePeriod: '17:00', m3:'16'},
                {timePeriod: '18:00', m3:'35'},
                {timePeriod: '19:00', m3:'79'},
                {timePeriod: '20:00', m3:'16'},
                {timePeriod: '21:00', m3:'17'},
                {timePeriod: '22:00', m3:'57'},
                {timePeriod: '23:00', m3:'42'},                
            ],
            xField: 'timePeriod',
            yField: 'm3',            
            
          }

          const config2 = {
            data: [
                {timePeriod: '8', m3:3339},
                {timePeriod: '7', m3:3404},
                {timePeriod: '6', m3:3309},
                {timePeriod: '5', m3:'3261'},
                {timePeriod: '4', m3:'3464'},
                {timePeriod: '3', m3:'2585'},
                {timePeriod: '2', m3:'2669'},
                {timePeriod: '1', m3:'2921'},                                
            ],
            xField: 'timePeriod',
            yField: 'm3',            
          }

          const config3 = {
            data: [
                {timePeriod: '8', m3:41.4},
                {timePeriod: '7', m3:'46.6'},
                {timePeriod: '6', m3:'30'},
                {timePeriod: '5', m3:'29.3'},
                {timePeriod: '4', m3:'30.5'},
                {timePeriod: '3', m3:'35.9'},
                {timePeriod: '2', m3:'30.6'},
                {timePeriod: '1', m3:'31.2'},                                
            ],
            xField: 'timePeriod',
            yField: 'm3',            
          }
        
        return(
            <Row>
                 <Col span={24}>
                    <TitleTy level={2}>Gráficos</TitleTy>
                </Col>
                    <Col span={24} >
                        <Button onClick={()=>setOption(0)} style={{backgroundColor:'#3968A9', color:'white', borderColor:'#3968A9', marginRight:'4px'}} size='small'>Acumulado(m3) - 24 horas</Button>
                        <Button onClick={()=>setOption(1)} size='small' style={{backgroundColor:'#3968A9', color:'white', borderColor:'#3968A9', marginRight:'4px'}} >Acumulado(m3) - Mensual</Button>
                        <Button onClick={()=>setOption(2)} size='small' style={{backgroundColor:'#3968A9', color:'white', borderColor:'#3968A9'}}>Columna de agua</Button>                        
                    </Col>
                    <Col span={24} style={{padding:'20px'}}>
                        {option==0 && <Line {...config} />}
                        {option==1 && <Area {...config2} />}
                        {option==2 && <Line {...config3} />}
                    </Col>
                </Row>
        )
    }

    const Analituc = () => {
        return(<Row>
            <Col span={24} style={{marginBottom:'40px'}}>
                    <TitleTy level={2}>Últimos datos enviados a la DGA {new Date().getDate()} - {new Date().getMonth()} - {new Date().getFullYear() } </TitleTy>
                </Col>

            <Col span={12}>
                <Table pagination={false} bordered columns={[
                            {title:'Hora', dataIndex:'number'},                        
                            {title:'Caudal', dataIndex:'name'},
                            {title:'Nivel', dataIndex: 'email'},
                            {title:'Acumulado', dataIndex: 'phone'},
                        ]} dataSource = {[
                            {
                                key: '1',
                                number: '00:00',
                                name: '2.3',
                                email: '3',
                                phone: '1220',
                            },
                            {
                                key: '1',
                                number: '01:00',
                                name: '2.1',
                                email: '3.5',
                                phone: '1420',
                            },
                            {
                                key: '1',
                                number: '02:00',
                                name: '2.2',
                                email: '4',
                                phone: '2100',
                            },
                            {
                                key: '1',
                                number: '03:00',
                                name: '2.7',
                                email: '5',
                                phone: '2450',
                            },
                            {
                                key: '1',
                                number: '04:00',
                                name: '2.9',
                                email: '2',
                                phone: '2800',
                            },
                            {
                                key: '1',
                                number: '05:00',
                                name: '2.1',
                                email: '6',
                                phone: '3221',
                            },
                            {
                                key: '1',
                                number: '065:00',
                                name: '2.9',
                                email: '8',
                                phone: '3611',
                            },
                        ]} />
            </Col>
            <Col span={12}>
                <center><img style={{marginTop:'50px'}} src={qr} width={'250px'} /></center>
                <center><Button onClick={()=>window.open('https://snia.mop.gob.cl/cExtracciones2/#/consultaExtraccionesDia')} style={{marginTop:'20px', backgroundColor:'#1F3461', borderColor:'#1F3461'}} type='primary'>Ir a mi DGA</Button></center>
            </Col>
        </Row>)
    }    
    const ListPersons = () => {
        return(<Row>
            <Col span={24}>
                    <TitleTy level={2}>Listado de usuarios autorizados</TitleTy>
                </Col>
                <Col span={24} style={{marginTop:'10px', marginBottom:'280px'}}>
                    <Table pagination={false} bordered columns={[
                        {title:'#', dataIndex:'number'},                        
                        {title:'Nombre', dataIndex:'name'},
                        {title:'Email', dataIndex: 'email'},
                        {title:'Teléfono', dataIndex: 'phone'},
                    ]} dataSource = {[
                        {
                            key: '1',
                            number: '1',
                            name: 'Constanza Hidd',
                            email: 'chidd@Lara.cl',
                            phone: '-',
                        },
                      ]} />
                </Col>
        </Row>)
    }   

    return(<Row align={'top'} style={{
        backgroundImage:`url(${wallpaper})`,
        minHeight: '720px',    
        /* Create the parallax 
        scrolling effect */
        backgroundAttachment: 'fixed',
        backgroundPosition: 'center',
        backgroundColor:'rgb(255,255,255,0,0.7)',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover'
    }}>
        <Col style={{paddingTop:'30px', paddingLeft:'40px'}} span={12}>
            <TitleTy level={3} style={{color:'white'}}>Monitoreo Extracciones Efectivas (DGA)</TitleTy>
        </Col>
        <Col style={{paddingTop:'30px'}} span={3} offset={8}>
            <UserOutlined style={{backgroundColor:'grey', color:'white', fontSize:'15px', borderRadius:'100%', padding:'10px', marginRight:'10px'}} />
            <Link to='/inicio'><ArrowLeftOutlined style={{backgroundColor:'#3968A9', color:'white', fontSize:'15px', borderRadius:'100%', padding:'10px'}}/></Link>
            
        </Col>                
        <Col span={24} style={{marginTop:'10px'}}>
            <Card style={{borderRadius:'30px 30px 0px 0px'}}>
                <Row>
                    <Col span={3} style={{paddingRight:'10px'}}>
                        <Card hoverable={true} style={{backgroundColor:'#1F3461', borderRadius:'20px'}}>
                            <center><img src={logo} width='50px' style={{marginBottom:'40px', }} /></center>                            
                            <div style={{textAlign:'center', backgroundColor:'white', marginLeft:'-24px', marginRight:'-24px',  marginBottom:'15px'}}>
                                <Button onClick={()=>setOption(0)} type='link' style={{color:'#1F3461'}}>Mi Pozo</Button>
                            </div>
                            <div style={{textAlign:'center', backgroundColor:'white', marginLeft:'-24px', marginRight:'-24px',  marginBottom:'15px', }}>
                                <Button onClick={()=>setOption(2)} type='link' style={{color:'#1F3461'}}>DGA</Button>                                
                            </div>                                                                                     
                            <div style={{textAlign:'center', backgroundColor:'white', marginLeft:'-24px', marginRight:'-24px',  marginBottom:'220px', }}>
                                <Button onClick={()=>setOption(3)} type='link' style={{color:'#1F3461'}}>Reportes</Button>                                
                            </div>                                                        
                            <div>
                                <center><img src={minLogo} /></center>
                            </div>
                        </Card>
                    </Col>
                    <Col span={17} style={{paddingRight:'5px'}}>
                        <Card hoverable={true} style={{backgroundColor:'#fafafa', borderRadius:'20px', marginLeft:'10px'}}>
                            {option == 0 && <Well />}                            
                            {option == 1 && <Graphics />}                            
                            {option == 2 && <Analituc />}                            
                            {option == 3 && <ListPersons />}                            
                        </Card>
                    </Col>
                    <Col span={4} >
                        <Card hoverable={true} style={{backgroundColor:'#1F3461', borderRadius:'20px'}}>
                            <TitleTy align='center' style={{color:'white'}} level={3}>POZO 4</TitleTy>
                            <TitleTy align='center' style={{color:'white', marginTop:'-10px'}} level={5}>Iansa</TitleTy>
                            <div style={{textAlign:'center', backgroundColor:'white', marginLeft:'-24px', marginRight:'-24px', marginBottom:'30px'}}>
                                Profundida del pozo:<br/>
                                <b><Typography.Paragraph style={{fontSize:'16px'}}>170 mtrs</Typography.Paragraph></b>
                            </div>
                            <div style={{textAlign:'center', backgroundColor:'white', marginLeft:'-24px', marginRight:'-24px', marginBottom:'30px'}}>
                                Posicionamiento de bomba:<br/>
                                <b><Typography.Paragraph style={{fontSize:'16px'}}>71 mtrs</Typography.Paragraph></b>
                            </div>
                            <div style={{textAlign:'center', backgroundColor:'white', marginLeft:'-24px', marginRight:'-24px', marginBottom:'30px'}}>
                                Posicionamiento de sensor (freatico):<br/>
                                <b><Typography.Paragraph style={{fontSize:'16px'}}>76 mtrs</Typography.Paragraph></b>
                            </div>
                            <div style={{textAlign:'center', backgroundColor:'white', marginLeft:'-24px', marginRight:'-24px', marginBottom:'30px'}}>
                                Diámetro ducto de salida (bomba)<br/>
                                <b><Typography.Paragraph style={{fontSize:'16px'}}>8 pulg</Typography.Paragraph></b>
                            </div>
                            <div style={{textAlign:'center', backgroundColor:'white', marginLeft:'-24px', marginRight:'-24px', marginBottom:'50px'}}>
                                Diámetro flujometro<br/>
                                <b><Typography.Paragraph style={{fontSize:'16px'}}>8 pulg</Typography.Paragraph></b>
                            </div>
                        </Card>
                    </Col>
                </Row>
            </Card>
        </Col>
    </Row>)
}


export default Dga