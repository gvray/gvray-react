import bgStarry from '@/assets/bg-starry.jpg';
import { publicAsset } from '@/utils';
import { styled } from 'umi';

interface LoginBgProps {
  children: React.ReactNode;
  title?: string;
  slogan?: string;
  subSlogan?: string;
  bgImage?: string;
}

const Root = styled.div`
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
`;

const Bg = styled.div`
  position: fixed;
  inset: 0;
  background-repeat: no-repeat;
  background-size: cover;
`;

const Title = styled.div`
  position: fixed;
  top: 60px;
  left: 70px;
  font-size: 24px;
  display: flex;
  align-items: center;
  color: #fff;
`;

const LogoImg = styled.img`
  width: 38px;
  margin-right: 4px;
`;

const Slogan = styled.div`
  position: fixed;
  left: 195px;
  top: 314px;
  color: #fff;

  h3 {
    font-size: 54px;
    letter-spacing: 0;
    font-weight: 700;
    margin-bottom: 0;
  }

  p {
    font-size: 32px;
    letter-spacing: 3.8px;
    font-weight: 300;
  }

  @media (max-width: 1150px) {
    display: none;
  }
`;

const CardContainer = styled.div`
  position: absolute;
  right: 120px;
  top: 50%;
  transform: translateY(-50%);
  width: 476px;
  max-height: 90vh;
  overflow: visible;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: stretch;
`;

const LoginBg: React.FC<LoginBgProps> = ({
  children,
  title,
  slogan = '用真诚',
  subSlogan = '让复杂的世界更美好',
  bgImage = bgStarry,
}) => {
  return (
    <Root>
      <Bg style={{ backgroundImage: `url('${bgImage}')` }} />
      <Title>
        <LogoImg src={publicAsset('logo-dark.svg')} />
        <strong>{title}</strong>
      </Title>
      <Slogan>
        <h3>{slogan}</h3>
        <p>{subSlogan}</p>
      </Slogan>
      <CardContainer>{children}</CardContainer>
    </Root>
  );
};

export default LoginBg;
