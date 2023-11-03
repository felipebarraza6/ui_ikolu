import React, { useContext } from 'react'
import { Row, Col, Input, Button, Space, Form, notification } from 'antd'
import wallpaper from '../assets/images/wallpaper.png'
import logo from '../assets/images/logozivo.png'
import sh from '../api/sh/endpoints'
import { AppContext } from '../App'


const Login = () => {

    const { dispatch } = useContext(AppContext)

    

    const finishLogin = async(values) => {
        try {
            const request = await sh.authenticated(values)      
            dispatch({
              type: 'LOGIN',
              payload: request
            })
            
            return request
          } catch(error) {
            notification.error({message: 'contraseña incorrecta'})
          }
    }

    return(<Row align={'middle'} justify='center' style={{
        backgroundImage:`url(${wallpaper})`,
        minHeight: '820px',    
      /* Create the parallax 
      scrolling effect */
      backgroundAttachment: 'fixed',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundSize: 'cover'

    
    }} >
        <Col offset={12} span={12} style={{paddingLeft:'230px', paddingRight:'140px', marginTop:'-130px'}}>
        <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
            <center><img src={logo} width='90px' style={{marginBottom:'20px'}} />
            <Form name='auth' onFinish={finishLogin} >
                <Form.Item name="email" rules={[{ required: true, message: 'Ingresa tu email!' }]}>
                    <Input placeholder='Usuario' style={{borderRadius:'10px', width:'200px'}} />
                </Form.Item>
                <Form.Item name="password" rules={[{ required: true, message: 'Ingresa tu clave!' }]}>
                    <Input type='password' placeholder='Clave' style={{borderRadius:'10px', width:'200px'}} />
                </Form.Item>
                <Form.Item>
                    <Button ghost htmlType='submit' style={{borderRadius:'10px', width:'200px'}}>Ingresar</Button>
                </Form.Item>
                
            </Form></center>
            </Space>            
        </Col>

    </Row>)
}


export default Login