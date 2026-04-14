import ReactJsonView from '@microlink/react-json-view';

interface Prop {
  jsonValue: {};
}

export const JsonView = ({ jsonValue }: Prop) => {
  return <ReactJsonView
    src={jsonValue}
    theme="shapeshifter:inverted"
    displayDataTypes={false}
    displayObjectSize={false}
    enableClipboard={true}
    name={false}
    style={{
      width: '100%',
      height: '400px',
      paddingLeft: '20px',
      paddingRight: '20px',
      overflowY: 'auto',
      textAlign: 'left',
      fontFamily: 'Fira Code, monospace',
      fontSize: '13px'
    }}
  />
}