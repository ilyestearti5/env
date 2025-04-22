import {
  EmptyComponent,
  Translate,
  Line,
  Field,
  Password,
  BooleanFeild,
  Button,
  CircleLoading,
  Card,
} from "biqpod/ui/components";
import {
  useCopyState,
  fieldHooks,
  showToast,
  useColorMerge,
  closeBottomSheet,
} from "biqpod/ui/hooks";
import { cloud } from "./server";
export const LoginAdmin = () => {
  const password = useCopyState<string | undefined>(undefined);
  const rememberMe = useCopyState<boolean | null>(false);
  const username = fieldHooks.getOneFeild("admin-username", "value");
  const isLoading = useCopyState(false);
  const colorMerge = useColorMerge();
  return (
    <div className="flex flex-col justify-center items-center p-2 w-full h-full">
      <Card className="w-1/2 max-md:w-4/6">
        <div className="flex items-center p-2">
          <h1 className="text-4xl capitalize">
            <Translate content="login" />
          </h1>
        </div>
        <Line />
        <div className="flex flex-col gap-y-2 p-2">
          <Field placeholder="Enter Username" inputName="admin-username" />
          <Password placeholder="Enter Password" state={password} />
          <div className="flex justify-center items-center">
            <BooleanFeild
              state={rememberMe}
              config={{
                style: "checkbox",
              }}
              id="remember-me"
            />
            <label htmlFor="remember-me" className="ml-2 capitalize">
              <Translate content="remember me" />
            </label>
          </div>
        </div>
        <Line />
        <div className="p-2">
          <Button
            className="rounded-full"
            onClick={async () => {
              if (!username) {
                showToast("Please enter username", "warning");
                return;
              }
              if (!password.get) {
                showToast("Please enter password", "warning");
                return;
              }
              isLoading.set(true);
              try {
                await cloud.app.auth.signInWithEmailAndPassword(
                  username,
                  password.get
                );
                closeBottomSheet();
              } catch (e) {
                console.log(e);
                showToast("Invalid username or password", "error");
              }
              isLoading.set(false);
            }}
          >
            <Translate content="login" />
          </Button>
        </div>
        {isLoading.get && (
          <div
            className="absolute inset-0 flex justify-center items-center"
            style={{
              ...colorMerge("gray.opacity", {}),
            }}
          >
            <CircleLoading />
          </div>
        )}
      </Card>
    </div>
  );
};
