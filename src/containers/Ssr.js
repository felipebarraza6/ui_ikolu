
import React, { useState, useEffect } from 'react'
import { Row, Col, Typography, Card, Statistic, Input, Button, Table, Select  } from 'antd'
import {UserOutlined, ClockCircleFilled, ArrowLeftOutlined } from '@ant-design/icons'
import logo from '../assets/images/logozivo.png'
import wallpaper  from '../assets/images/wallssr.png'
import { Link } from "react-router-dom"
import minLogo  from '../assets/images/min_logo.png'

import caudal_img  from '../assets/images/caudal.png'
import nivel_img  from '../assets/images/nivel.png'
import acumulado_img  from '../assets/images/acumulado.png'
import pozo1  from '../assets/images/pozo2.png'
import { Area, Line } from '@ant-design/plots'
import g1 from '../assets/images/g1.png'


import kpi1_1 from '../assets/images/kpi2/1.png'
import kpi1_2 from '../assets/images/kpi2/2.png'
import kpi1_3 from '../assets/images/kpi2/3.png'
import kpi1_4 from '../assets/images/kpi2/4.png'
import kpi1_5 from '../assets/images/kpi2/5.png'
import kpi1_6 from '../assets/images/kpi2/6.png'
  
  
const { Title:TitleTy } =Typography
const { Countdown } = Statistic;

const Ssr = () => {

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
                                            <Col span={12} offset={7} style={{marginTop:'-15px'}}><Typography.Paragraph level={5}><b>6.4 (Litros)</b></Typography.Paragraph></Col>
                                        </Row>                                    
                                    </Card>
                                    <Card hoverable style={{marginBottom:'10px', marginTop:'20px', border:'solid 1px grey', borderRadius:'15px'}}>
                                        <Row align='middle'>
                                            <Col span={7}><img src={nivel_img} width='60px' /></Col>
                                            <Col span={12}><TitleTy level={5} style={{color:'#222221'}}>Nivel Freático</TitleTy></Col>                                            
                                            <Col span={12} offset={7} style={{marginTop:'-25px'}}><Typography.Paragraph level={5}><b>0.0 (Metros)</b></Typography.Paragraph></Col>
                                        </Row>                                    
                                    </Card>
                                    <Card hoverable style={{marginBottom:'50px', marginTop:'20px', border:'solid 1px grey', borderRadius:'15px'}}>
                                        <Row align='middle'>
                                            <Col span={7}><img src={acumulado_img} width='60px'  /></Col>
                                            <Col span={17}><TitleTy level={5} style={{color:'#222221'}}>Acumulado</TitleTy></Col>                                            
                                            <Col span={12} offset={7} style={{marginTop:'-25px'}}><Typography.Paragraph level={5}><b>80.576 (M3)</b></Typography.Paragraph></Col>
                                        </Row>                                    
                                    </Card>
                                </Col>
                                <Col span={12} style={{paddingLeft:'5px', paddingTop:'70px'}}>
                                    <center>
                                        <img src={pozo1} width={'330px'} style={{position:'absolute', marginLeft:'-140px'}} />                                        
                                    </center>
                                        <Input style={{width:'80px', marginTop:'80px', marginLeft:'30px', position:'absolute', borderRadius:'10px'}} value={'1.5 Mtrs'} />
                                        <Input style={{width:'80px', marginTop:'65px', marginLeft:'150px', position:'absolute', borderRadius:'10px'}} value={'6.4 Ltrs'}  />
                                        <Input style={{width:'70px', marginTop:'220px', marginLeft:'250px', position:'absolute', borderRadius:'10px'}} value={'0.0 Mtr'}  />
                                        <Input style={{width:'95px', marginTop:'110px', marginLeft:'220px', position:'absolute', borderRadius:'10px'}} value={'80.576 M3'} />
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
                {timePeriod: '01:00', m3:'42'},
                {timePeriod: '02:00', m3:'33'},
                {timePeriod: '03:00', m3:'64'},
                {timePeriod: '04:00', m3:'67'},
                {timePeriod: '05:00', m3:'75'},
                {timePeriod: '06:00', m3:'99'},
                {timePeriod: '07:00', m3:'40'},
                {timePeriod: '08:00', m3:'34'},
                {timePeriod: '09:00', m3:'79'},
                {timePeriod: '10:00', m3:'63'},
                {timePeriod: '11:00', m3:'98'},
                {timePeriod: '12:00', m3:'59'},
                {timePeriod: '13:00', m3:'44'},
                {timePeriod: '14:00', m3:'58'},
                {timePeriod: '15:00', m3:'90'},
                {timePeriod: '16:00', m3:'89'},
                {timePeriod: '17:00', m3:'72'},
                {timePeriod: '18:00', m3:'92'},
                {timePeriod: '19:00', m3:'57'},
                {timePeriod: '20:00', m3:'73'},
                {timePeriod: '21:00', m3:'19'},
                {timePeriod: '22:00', m3:'08'},
                {timePeriod: '23:00', m3:'32'},                
            ],
            xField: 'timePeriod',
            yField: 'm3',            
          }

          const config2 = {
            data: [
                {timePeriod: '8', m3:542.78},
                {timePeriod: '7', m3:'433.06'},
                {timePeriod: '6', m3:'364.37'},
                {timePeriod: '5', m3:'367.12'},
                {timePeriod: '4', m3:'375.63'},
                {timePeriod: '3', m3:'399.39'},
                {timePeriod: '2', m3:'440.41'},
                {timePeriod: '1', m3:'434.14'},                                
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
            <Col span={24}>
                    <TitleTy level={2}>Análisis de datos</TitleTy>
                </Col>            
            <Col span={8} style={{marginBottom:'10px'}}>
                        <img src={kpi1_5} width={'280px'}/>
            </Col>
            <Col span={8} style={{marginBottom:'10px'}}>
                        <img src={kpi1_4} width={'280px'}/>
            </Col>
            <Col span={8} style={{marginBottom:'10px'}}>
                        <img src={kpi1_3} width={'280px'} />
            </Col>
            <Col span={8} style={{marginBottom:'10px'}}>
                        <img src={kpi1_2} width={'280px'}/>
            </Col>
            <Col span={8} style={{marginBottom:'10px'}}>
                        <img src={kpi1_1} width={'280px'}/>
            </Col>
            <Col span={8} style={{marginBottom:'10px'}}>
                        <img src={kpi1_6} width={'280px'} />
            </Col>
        </Row>)
    }  
    const Fact = () => {
        return(<Row>
            <Col span={24}>
                    <TitleTy level={2}>Historial de Facturación</TitleTy>
                </Col> 
                <Col style={{marginTop:'30px'}}>
                <Table size='small' bordered columns={[                        
                    {title:'Fecha', dataIndex:'fecha'},
                        {title:'Producción', dataIndex:'a'},
                        {title:'Facturación', dataIndex: 'b'},
                        {title:'Estanques llenados/mes', dataIndex: 'c'},
                        {title:'Estanques llenados/día', dataIndex: 'd'},
                        {title:'% perdida', dataIndex: 'e'},
                        {title:'% m3 perdida', dataIndex: 'f'},
                    ]} dataSource = {[
                        {
                            key: '1',
                            fecha: '05-2022	',
                            acumulado_img: '1',
                            a: '12229',
                            b: '6115',
                            c: '122.3',
                            d: '3.9',
                            e: '49%',
                            f: '6114'
                        },
                        {
                            key: '1',
                            acumulado_img: '1',
                            fecha: '04-2022	',
                            a: '10731',
                            b: '5345',
                            c: '107.3',
                            d: '3.5',
                            e: '50%',
                            f: '5386'
                        },
                        {
                            key: '1',
                            acumulado_img: '1',
                            fecha: '03-2022	',
                            a: '12229',
                            b: '6115',
                            c: '122.3',
                            d: '3.9',
                            e: '49%',
                            f: '3518'
                        },
                        {
                            key: '1',
                            acumulado_img: '1',
                            fecha: '02-2022	',
                            a: '12229',
                            b: '6115',
                            c: '122.3',
                            d: '3.9',
                            e: '49%',
                            f: '3799'
                        }
                        
                      ]} />
                </Col>
                <Col style={{marginLeft:'0px',marginTop:'20px'}}>
                    <Select placeholder='Selecciona un mes...'>
                        <Select.Option value='Enero'>Enero</Select.Option>
                        <Select.Option value='Febrero'>Febrero</Select.Option>
                        <Select.Option value='Marzo'>Marzo</Select.Option>
                        <Select.Option value='Abril'>Abril</Select.Option>
                        <Select.Option value='Mayo'>Mayo</Select.Option>
                        <Select.Option value='Junio'>Junio</Select.Option>
                        <Select.Option value='Julio'>Julio</Select.Option>
                        <Select.Option value='Agosto'>Agosto</Select.Option>
                        <Select.Option value='Septiembre'>Septiembre</Select.Option>
                        <Select.Option value='Octubre'>Octubre</Select.Option>
                        <Select.Option value='Noviembre'>Noviembre</Select.Option>
                        <Select.Option value='Diciembre'>Diciembre</Select.Option>
                    </Select>
                </Col>
                <Col style={{marginLeft:'20px',marginTop:'20px'}}>
                    <Input style={{width:'250px'}} placeholder='Ingresa el total de litros facturados...' />
                </Col>
                <Col style={{marginLeft:'20px', marginTop:'20px'}}>
                    <Button type='primary' style={{backgroundColor:'#1F3461', borderColor:'#1F3461', borderRadius:'10px'}}>AGREGAR</Button>
                </Col>
            </Row>)
    }
    const ListPersons = () => {
        return(<Row>
            <Col span={24}>
                    <TitleTy level={2}>Listado de usuarios autorizados</TitleTy>
                </Col>
                <Col span={24} style={{marginTop:'10px', marginBottom:'280px'}}>
                    <Table bordered columns={[
                        {title:'#', dataIndex:'number'},                        
                        {title:'Nombre', dataIndex:'name'},
                        {title:'Email', dataIndex: 'email'},
                        {title:'Teléfono', dataIndex: 'phone'},
                    ]} dataSource = {[
                        {
                            key: '1',
                            number: '1',
                            name: 'Pablo Becerra',
                            email: 'aprsanjosedepenuelas@gmail.com',
                            phone: '+56992635174',
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
        <Col style={{paddingTop:'30px', paddingLeft:'40px'}} span={16}>
            <TitleTy level={3} style={{color:'white'}}>Monitoreo Servicios Sanitarios Rurales (SSR)</TitleTy>
        </Col>
        <Col style={{paddingTop:'30px'}} span={3} offset={5}>
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
                            <div style={{textAlign:'center', backgroundColor:'white', marginLeft:'-24px', marginRight:'-24px',  marginBottom:'15px'}}>
                                <Button onClick={()=>setOption(4)} type='link' style={{color:'#1F3461'}}>Facturación</Button>
                            </div>
                            <div style={{textAlign:'center', backgroundColor:'white', marginLeft:'-24px', marginRight:'-24px',  marginBottom:'15px'}}>
                                <Button onClick={()=>setOption(1)} type='link' style={{color:'#1F3461'}}>Gráficos</Button>                                
                            </div>
                            <div style={{textAlign:'center', backgroundColor:'white', marginLeft:'-24px', marginRight:'-24px',  marginBottom:'15px', }}>
                                <Button onClick={()=>setOption(2)} type='link' style={{color:'#1F3461'}}>Análisis</Button>                                
                            </div>
                            <div style={{textAlign:'center', backgroundColor:'white', marginLeft:'-24px', marginRight:'-24px',  marginBottom:'170px', }}>
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
                            {option == 4 && <Fact />}                            
                        </Card>
                    </Col>
                    
                </Row>
                
            </Card>
        </Col>
    </Row>)
}


export default Ssr