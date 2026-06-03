// draggableNode.js

export const DraggableNode = ({ type, label, icon, color = '#1C2536' }) => {
  const onDragStart = (event, nodeType) => {
    const appData = { nodeType };
    event.target.style.cursor = 'grabbing';
    event.dataTransfer.setData('application/reactflow', JSON.stringify(appData));
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      className={type}
      onDragStart={(event) => onDragStart(event, type)}
      onDragEnd={(event) => (event.target.style.cursor = 'grab')}
      style={{
        cursor: 'grab',
        minWidth: '90px',
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        borderRadius: '8px',
        background: color,
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '2px',
        color: '#fff',
        fontSize: '12px',
        fontWeight: 600,
        boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
        transition: 'transform 0.15s, box-shadow 0.15s',
        userSelect: 'none',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 4px 10px rgba(0,0,0,0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.1)';
      }}
      draggable
    >
      {icon && <span style={{ fontSize: '18px' }}>{icon}</span>}
      <span>{label}</span>
    </div>
  );
};
