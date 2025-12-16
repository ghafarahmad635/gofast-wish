interface Props {
  children: React.ReactNode;
};

const Layout = ({ children }: Props) => {
  return ( 
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center ">
      <div className="w-full ">
        {children}
      </div>
    </div>
  );
};
 
export default Layout;
