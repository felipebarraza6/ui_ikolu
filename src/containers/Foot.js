
import React, { useState, useEffect } from 'react'
import { Row, Col, Typography, Card, Statistic, Input, Button, Table, Select  } from 'antd'
import {UserOutlined, ClockCircleFilled, ArrowLeftOutlined } from '@ant-design/icons'
import logo from '../assets/images/logozivo.png'
import wallpaper  from '../assets/images/wallssr.png'
import { Link } from "react-router-dom"
import minLogo  from '../assets/images/min_logo.png'
import truck from '../assets/images/foo/truck.png'
import planet from '../assets/images/foo/planet.png'
import line1 from '../assets/images/foo/line1.png'

import line2 from '../assets/images/foo/line2.png'


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

const Foot = () => {

    const deadline = Date.now() + 10 * 1 * 60 * 24 * 2 + 1000 * 30; // Moment is also OK
    const [option, setOption] = useState(0)

    const Well = () => {
        return(
            <Row>
                 <Col span={24}>
                    <TitleTy level={2}>Consumo en M3</TitleTy>
                </Col>
                <Col span={24}>
                <Table pagination={false} size='small' bordered columns={[                        
                        {title:'Tipo', dataIndex:'tipo'},
                        {title:'Enero', dataIndex:'fecha'},
                        {title:'Febrero', dataIndex:'a'},
                        {title:'Marzo', dataIndex: 'b'},
                        {title:'Abril', dataIndex: 'c'},
                        {title:'Mayo', dataIndex: 'd'},
                        {title:'Junio', dataIndex: 'e'},                        
                    ]} dataSource = {[
                        {
                            key: '1',
                            tipo:'Agua de pozo',
                            fecha: '11.988',
                            acumulado_img: '1122',
                            a: '12.229',
                            b: '16.115',
                            c: '19.012',
                            d: '23.839',
                            e: '26.982',
                            f: '29.348'
                        },
                        {
                            key: '2',
                            tipo:'Agua Potable',
                            acumulado_img: '1',
                            fecha: '920	',
                            a: '1.200',
                            b: '2.200',
                            c: '3.900',
                            d: '5.200',
                            e: '6.400',
                            f: '8.500'
                        },
                       
                        
                      ]} /><br/>
                <Table pagination={false} size='small' bordered columns={[                        
                        {title:'Tipo', dataIndex:'tipo'},
                        {title:'Julio', dataIndex:'fecha'},
                        {title:'Agosto', dataIndex:'a'},
                        {title:'Septiembre', dataIndex: 'b'},
                        {title:'Octubre', dataIndex: 'c'},
                        {title:'Noviembre', dataIndex: 'd'},
                        {title:'Diciembre', dataIndex: 'e'},                        
                    ]} dataSource = {[
                        {
                            key: '1',
                            tipo:'Agua de pozo',
                            fecha: '27.320',
                            acumulado_img: '28.120',
                            a: '28.120',
                            b: '30.115',
                            c: '31.012',
                            d: '32.839',
                            e: '33.982',
                            f: '35.348'
                        },
                        {
                            key: '2',
                            tipo:'Agua Potable',
                            acumulado_img: '1',
                            fecha: '7.304	',
                            a: '8.200',
                            b: '9.200',
                            c: '10.900',
                            d: '12.200',
                            e: '14.400',
                            f: '16.500'
                        },
                       
                        
                      ]} />
                </Col>
                <Col style={{marginTop:'30px'}}>
                    <TitleTy level={3}>Consumo Total</TitleTy>
                    <TitleTy style={{marginLeft:'20px', marginTop:'-10px'}} level={5}>Agua de pozo: 33.982 M3</TitleTy>
                    <TitleTy style={{marginLeft:'20px', marginTop:'-10px'}} level={5}>Agua potable: 14.00 M3</TitleTy>
                    
                </Col>
            </Row>
        )
    }

    const Foot = () => {

        return(<Row>
            <Col span={24} style={{marginBottom:'30px'}}>
               <TitleTy level={2}>Huella - Lechugas El de Arriba</TitleTy>
            </Col>
            <Col span={6} style={{marginRight:'30px'}}>
                <center><TitleTy level={3}>Huella Cliente</TitleTy>
                <img src={truck} width='80%' /></center>
                <center><div style={{marginTop:'40px', backgroundColor:'#CBCE07', fontSize:'20px'}}><b>130 Litros por Lechuga</b></div></center>

            </Col>
            <Col span={6}>
                <img src={line1} width='100px' />
            </Col>
            <Col span={6} >
                <img src={line2} width='78px'  />                
            </Col>
            <Col span={6} style={{marginLeft:'-60px'}}>
                <center><TitleTy level={3}>Huella Mundial</TitleTy>
                <img src={planet} width='80%' /></center>
                <center><div style={{marginTop:'40px', backgroundColor:'#CBCE07', fontSize:'20px'}}><b>165 Litros por Lechuga</b></div></center>
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
            <TitleTy level={3} style={{color:'white'}}>Huella Hidrica</TitleTy>
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
                            <center><img src={logo} width='50px' style={{marginBottom:'90px', }} /></center>                                                        
                            <div style={{textAlign:'center', backgroundColor:'white', marginLeft:'-24px', marginRight:'-24px',  marginBottom:'15px'}}>
                                <Button onClick={()=>setOption(0)} type='link' style={{color:'#1F3461'}}>Consumo</Button>
                            </div>
                            <div style={{textAlign:'center', backgroundColor:'white', marginLeft:'-24px', marginRight:'-24px',  marginBottom:'275px'}}>
                                <Button onClick={()=>setOption(1)} type='link' style={{color:'#1F3461'}}>Huella</Button>                                
                            </div>
                                                      
                            <div>
                                <center><img src={minLogo} /></center>
                            </div>
                        </Card>
                    </Col>
                    <Col span={21} style={{paddingRight:'5px'}}>
                        <Card hoverable={true} style={{backgroundColor:'#fafafa', borderRadius:'20px', marginLeft:'10px'}}>
                            {option == 0 && <Well />}                                                                                                                
                            {option == 1 && <Foot />}                                                                                                                
                        </Card>
                    </Col>
                    
                </Row>
                
            </Card>
        </Col>
    </Row>)
}


export default Foot