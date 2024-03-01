const updateFarebeepCardPageLoggedOutView = () => {
    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1, textAlign: 'center', background: 'rgba(0, 0, 0, 0.5)', padding: '20px', borderRadius: '8px' }}>
            <h1 style={{ color: '#fff', marginBottom: '10px', fontFamily: 'Arial, sans-serif' }}>
                PLEASE LOGIN TO ACCESS FARES
            </h1>
        </div>
        {/* eslint-disable-next-line jsx-a11y/img-redundant-alt */}
        <img
            src="./singapore-lrt-mrt-train.jpg"  // Replace with the actual path or URL of your image
            alt="Login Image"
            style={{
                width: '100%', 
                height: '100%', 
                objectFit: 'cover',  // Cover the entire container
            }}
        />
    </div>
    );
}

export default updateFarebeepCardPageLoggedOutView;