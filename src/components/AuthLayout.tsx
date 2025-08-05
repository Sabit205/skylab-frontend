import { Outlet } from "react-router-dom";
import { Container, Paper } from "@mantine/core";

const AuthLayout = () => {
    return (
        <Container size={420} my={40}>
            <Paper withBorder shadow="md" p={30} mt={30} radius="md">
                <Outlet />
            </Paper>
        </Container>
    );
};

export default AuthLayout;