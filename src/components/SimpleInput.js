const SimpleInput = ({ onChange, value, placeholder }) => (
    <input
        placeholder={placeholder}
        style={{
            flex: 1,
            border: "1px solid lightgray",
            borderRadius: "20px",
            width: "calc(100% - 10px)",
            padding: "5px",
            boxSizing: "border-box",
            textAlign: "center",
            margin: "5px",
        }}
        value={value}
        onChange={onChange}
    />
);

export default SimpleInput;
