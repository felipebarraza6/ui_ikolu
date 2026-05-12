import React, { useRef } from 'react';
import { Input, Button, Flex, Tooltip } from 'antd';
import {
  BoldOutlined,
  ItalicOutlined,
  UnorderedListOutlined,
  OrderedListOutlined,
  LinkOutlined,
} from '@ant-design/icons';

const { TextArea } = Input;

/**
 * SimpleEmailEditor — Editor de texto simple para correos
 *
 * Herramientas: bold, italic, lista, lista numerada, link
 * Inserta markup simple (**bold**, *italic*) que se puede procesar después
 */
const SimpleEmailEditor = ({ value, onChange, rows = 6, placeholder }) => {
  const textareaRef = useRef(null);

  const insertAtCursor = (before, after = '') => {
    const textarea = textareaRef.current?.resizableTextArea?.textArea;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = value || '';
    const selected = text.substring(start, end);

    const newText = text.substring(0, start) + before + selected + after + text.substring(end);
    onChange(newText);

    // Restaurar foco y posicion del cursor
    setTimeout(() => {
      textarea.focus();
      const newCursor = start + before.length + selected.length;
      textarea.setSelectionRange(newCursor, newCursor);
    }, 0);
  };

  const tools = [
    { icon: <BoldOutlined />, title: 'Negrita', action: () => insertAtCursor('**', '**') },
    { icon: <ItalicOutlined />, title: 'Cursiva', action: () => insertAtCursor('*', '*') },
    { icon: <UnorderedListOutlined />, title: 'Lista', action: () => insertAtCursor('\n- ') },
    { icon: <OrderedListOutlined />, title: 'Lista numerada', action: () => insertAtCursor('\n1. ') },
    { icon: <LinkOutlined />, title: 'Enlace', action: () => insertAtCursor('[', '](url)') },
  ];

  return (
    <Flex vertical gap={8}>
      {/* Barra de herramientas */}
      <Flex
        gap={4}
        style={{
          padding: '6px 8px',
          background: '#f5f5f5',
          borderRadius: '6px 6px 0 0',
          border: '1px solid #d9d9d9',
          borderBottom: 'none',
        }}
      >
        {tools.map((tool, idx) => (
          <Tooltip key={idx} title={tool.title}>
            <Button
              type="text"
              size="small"
              icon={tool.icon}
              onClick={tool.action}
              style={{ color: '#595959' }}
            />
          </Tooltip>
        ))}
      </Flex>
      <TextArea
        ref={textareaRef}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          borderRadius: '0 0 6px 6px',
          fontSize: 13,
          lineHeight: 1.6,
        }}
      />
    </Flex>
  );
};

export default SimpleEmailEditor;
