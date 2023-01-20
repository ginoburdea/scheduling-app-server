-- CreateTable
CREATE TABLE "appointments" (
    "id" SERIAL NOT NULL,
    "clientName" TEXT NOT NULL,
    "clientPhoneNumber" TEXT NOT NULL,
    "onDate" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL,
    "calendarId" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_calendarId_fkey" FOREIGN KEY ("calendarId") REFERENCES "calendars"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
