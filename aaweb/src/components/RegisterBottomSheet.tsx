import { X, UserPlus, GraduationCap, BookOpen } from 'lucide-react';

interface RegisterBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onStudentRegister: () => void;
  onTeacherRegister: () => void;
  onClassRegister: () => void;
}

export function RegisterBottomSheet({
  isOpen,
  onClose,
  onStudentRegister,
  onTeacherRegister,
  onClassRegister,
}: RegisterBottomSheetProps) {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 max-h-[80vh] overflow-y-auto">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">등록하기</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          <button
            onClick={() => {
              onTeacherRegister();
              onClose();
            }}
            className="w-full flex items-center gap-4 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-left"
          >
            <div className="p-3 bg-green-500 rounded-lg">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-semibold text-gray-800">선생님 등록</div>
              <div className="text-sm text-gray-600">새로운 선생님을 등록합니다</div>
            </div>
          </button>

          <button
            onClick={() => {
              onClassRegister();
              onClose();
            }}
            className="w-full flex items-center gap-4 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-left"
          >
            <div className="p-3 bg-purple-500 rounded-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-semibold text-gray-800">수업 등록</div>
              <div className="text-sm text-gray-600">새로운 수업을 등록합니다</div>
            </div>
          </button>

          <button
            onClick={() => {
              onStudentRegister();
              onClose();
            }}
            className="w-full flex items-center gap-4 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-left"
          >
            <div className="p-3 bg-blue-500 rounded-lg">
              <UserPlus className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-semibold text-gray-800">학생 등록</div>
              <div className="text-sm text-gray-600">새로운 학생을 등록합니다</div>
            </div>
          </button>
        </div>
      </div>
    </>
  );
}

