import Container from './container';

const Footer = () => {
  return (
    <footer className="bg-neutral-50 border-t border-neutral-200">
      <Container>
        <div className="flex flex-col lg:flex-row">
          <div>
            <p>&copy;{` ${new Date().getFullYear()} - Satokin`}</p>
          </div>
          <div className="flex-grow"></div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
